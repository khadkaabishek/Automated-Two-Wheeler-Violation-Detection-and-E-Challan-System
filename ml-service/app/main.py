"""
E-Challan Two-Wheeler Violation Screening Service
===================================================
A standalone FastAPI service wrapping four models in a deliberately staged
pipeline, rather than running everything on every photo unconditionally:

  Stage 1 — Vehicle type screening (vehicle_type_best.pt)
            9 classes: auto_rickshaw, bicycle, bus, car, motorcycle,
            pickup, scooter, truck, van.
            This platform only handles two-wheeler violations, so a photo
            is only carried forward if it contains a motorcycle or scooter.

  Stage 2 — Runs only if Stage 1 found a two-wheeler:
            2a. Helmet detection (helmet_best.pt) — classes: helmet, no_helmet.
            2b. Triple-riding check (person_yolov8n.pt — the standard
                Ultralytics/YOLOv8 COCO-pretrained nano model, pulled from
                Hugging Face) — counts how many people fall within an
                expanded region around each detected two-wheeler's bounding
                box. Three or more -> "Triple Riding" suggested violation.
                This is a proximity heuristic, not per-rider instance
                segmentation, so it's reported with the raw count so an
                officer can sanity-check it against the photo, same as
                every other suggestion this service makes.

  Stage 3 — Number-plate detection (number_plate_detect_best.pt) — only
            runs if Stage 2 found *any* confident violation. There's no
            point locating a plate on a photo with nothing to report.

The service never issues or auto-creates anything — it returns a
"submit to a traffic officer for review" style result that the backend
turns into a review-queue item (see /flagged-detections in the Node API).

Run locally:
    pip install -r requirements.txt
    uvicorn app.main:app --host 0.0.0.0 --port 8000
"""

import base64
import io
import os
import tempfile
import time
from typing import List, Optional

import cv2
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image, ImageDraw, ImageFont
from ultralytics import YOLO

app = FastAPI(
    title="E-Challan Two-Wheeler Violation Screening Service",
    description=(
        "Staged vehicle-type -> (helmet + triple-riding) -> plate detection "
        "pipeline for two-wheeler citations."
    ),
    version="3.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = "models"
VEHICLE_MODEL_PATH = f"{MODELS_DIR}/vehicle_type_best.pt"
HELMET_MODEL_PATH = f"{MODELS_DIR}/helmet_best.pt"
PLATE_MODEL_PATH = f"{MODELS_DIR}/number_plate_detect_best.pt"
# Standard Ultralytics/YOLOv8 COCO-pretrained nano weights, hosted on
# Hugging Face at https://huggingface.co/Ultralytics/YOLOv8 (yolov8n.pt).
# Used only for its "person" class (COCO id 0) to power the triple-riding
# heuristic below — see README for how to fetch it via conda/huggingface_hub.
PERSON_MODEL_PATH = f"{MODELS_DIR}/person_yolov8n.pt"

VEHICLE_CONF_THRESHOLD = 0.20
HELMET_CONF_THRESHOLD = 0.35
PERSON_CONF_THRESHOLD = 0.30
PLATE_CONF_THRESHOLD = 0.35
VIOLATION_CONF_THRESHOLD = 0.5  # stricter bar before we call it a suggested violation
TRIPLE_RIDING_MIN_COUNT = 3

# Video is sampled, not processed frame-by-frame — running all 4 models on
# every single frame of a video would take minutes on CPU for even a short
# clip. Instead we take up to MAX_VIDEO_SAMPLES frames spread evenly across
# the whole video, so a 10-second clip and a 2-minute clip both get
# reasonable coverage without one blocking the request for an unreasonable
# amount of time.
MAX_VIDEO_SAMPLES = 60
MAX_VIDEO_VIOLATIONS_RETURNED = 12

TWO_WHEELER_LABELS = {"motorcycle", "scooter"}
COCO_PERSON_CLASS = 0

vehicle_model: Optional[YOLO] = None
helmet_model: Optional[YOLO] = None
person_model: Optional[YOLO] = None
plate_model: Optional[YOLO] = None
load_error: Optional[str] = None

try:
    vehicle_model = YOLO(VEHICLE_MODEL_PATH)
    helmet_model = YOLO(HELMET_MODEL_PATH)
    person_model = YOLO(PERSON_MODEL_PATH)
    plate_model = YOLO(PLATE_MODEL_PATH)
except Exception as exc:  # noqa: BLE001 - report any load failure, don't crash startup
    load_error = str(exc)


class Detection(BaseModel):
    label: str
    confidence: float
    box: List[float]  # [x1, y1, x2, y2] in original image pixels


class RiderCount(BaseModel):
    vehicleBox: List[float]
    riderCount: int
    isViolation: bool


class ScreenResponse(BaseModel):
    imageWidth: int
    imageHeight: int

    # Stage 1
    vehicleDetections: List[Detection]
    isTwoWheeler: bool
    eligibilityMessage: str

    # Stage 2 (empty unless isTwoWheeler)
    helmetDetections: List[Detection]
    riderCounts: List[RiderCount]

    # Stage 3 (empty unless a violation was found in Stage 2)
    plateDetections: List[Detection]
    platePreviewsBase64: List[str]

    suggestedViolations: List[str]
    stagesRun: List[str]

    # A single, unambiguous machine-readable outcome plus a ready-to-display
    # message, so the frontend never has to re-derive "what actually
    # happened" from the raw detection arrays above:
    #   NO_VEHICLE            - nothing detected at all
    #   NOT_TWO_WHEELER       - a vehicle was found, but not a motorcycle/scooter
    #   NO_VIOLATION          - two-wheeler found, checked, nothing to report
    #   VIOLATION_NO_PLATE    - violation found, but no plate was located
    #   VIOLATION_WITH_PLATE  - violation found, plate located
    resultStatus: str
    resultMessage: str

    # The original photo with bounding boxes drawn directly on it (blue for
    # vehicles, green/red for helmet/no_helmet, amber for plates) — a
    # ready-to-display image, not just raw coordinates the frontend has to
    # render itself.
    annotatedImageBase64: str

    processingMs: int


@app.get("/health")
def health():
    return {
        "status": "ok" if not load_error else "degraded",
        "vehicleModelLoaded": vehicle_model is not None,
        "helmetModelLoaded": helmet_model is not None,
        "personModelLoaded": person_model is not None,
        "plateModelLoaded": plate_model is not None,
        "vehicleClasses": vehicle_model.names if vehicle_model else None,
        "helmetClasses": helmet_model.names if helmet_model else None,
        "plateClasses": plate_model.names if plate_model else None,
        "loadError": load_error,
    }


def _to_detections(results, model) -> List[Detection]:
    out = []
    for box in results.boxes:
        cls_id = int(box.cls[0])
        out.append(
            Detection(
                label=model.names[cls_id],
                confidence=round(float(box.conf[0]), 4),
                box=[round(v, 1) for v in box.xyxy[0].tolist()],
            )
        )
    return out


def _crop_base64(image: Image.Image, box: List[float]) -> str:
    x1, y1, x2, y2 = [max(0, int(v)) for v in box]
    crop = image.crop((x1, y1, x2, y2))
    buf = io.BytesIO()
    crop.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("ascii")


_ANNOTATION_COLORS = {
    "vehicle": (59, 130, 196),     # blue
    "helmet": (47, 182, 117),      # green
    "no_helmet": (198, 42, 58),    # red
    "plate": (245, 166, 35),       # amber
}


def _get_font(size: int = 16):
    try:
        return ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", size)
    except Exception:
        try:
            return ImageFont.truetype("DejaVuSans.ttf", size)
        except Exception:
            return ImageFont.load_default()


def _draw_box(draw: ImageDraw.ImageDraw, box: List[float], color, label: str, font) -> None:
    x1, y1, x2, y2 = box
    draw.rectangle([x1, y1, x2, y2], outline=color, width=4)
    text_bbox = draw.textbbox((0, 0), label, font=font)
    text_w, text_h = text_bbox[2] - text_bbox[0], text_bbox[3] - text_bbox[1]
    pad = 4
    label_y = max(0, y1 - text_h - pad * 2)
    draw.rectangle([x1, label_y, x1 + text_w + pad * 2, label_y + text_h + pad * 2], fill=color)
    draw.text((x1 + pad, label_y + pad), label, fill=(255, 255, 255), font=font)


def _annotate_image(
    image: Image.Image,
    vehicle_detections: List[Detection],
    helmet_detections: List[Detection],
    plate_detections: List[Detection],
) -> str:
    """Draws every detection this pipeline made directly onto a copy of the
    photo and returns it as a base64 JPEG — a single ready-to-display image
    instead of raw coordinates the frontend would otherwise have to scale
    and render itself."""
    annotated = image.copy()
    draw = ImageDraw.Draw(annotated)
    font = _get_font(max(14, image.width // 80))

    for d in vehicle_detections:
        _draw_box(draw, d.box, _ANNOTATION_COLORS["vehicle"], f"{d.label} {round(d.confidence * 100)}%", font)
    for d in helmet_detections:
        color = _ANNOTATION_COLORS["no_helmet"] if d.label == "no_helmet" else _ANNOTATION_COLORS["helmet"]
        _draw_box(draw, d.box, color, f"{d.label} {round(d.confidence * 100)}%", font)
    for d in plate_detections:
        _draw_box(draw, d.box, _ANNOTATION_COLORS["plate"], f"plate {round(d.confidence * 100)}%", font)

    buf = io.BytesIO()
    annotated.convert("RGB").save(buf, format="JPEG", quality=88)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def _expand_box(box: List[float], up_factor: float = 1.6, side_factor: float = 1.3) -> List[float]:
    """Expands a vehicle bounding box upward and sideways to roughly cover
    where riders' torsos/heads would be, since a tight vehicle box only
    covers the bike itself, not the people sitting on it."""
    x1, y1, x2, y2 = box
    w, h = x2 - x1, y2 - y1
    cx = (x1 + x2) / 2
    return [cx - w * side_factor / 2, y1 - h * (up_factor - 1), cx + w * side_factor / 2, y2]


def _box_center_inside(box: List[float], region: List[float]) -> bool:
    cx, cy = (box[0] + box[2]) / 2, (box[1] + box[3]) / 2
    return region[0] <= cx <= region[2] and region[1] <= cy <= region[3]


def _run_pipeline(image: Image.Image) -> dict:
    """Runs the full staged pipeline on a single already-decoded image and
    returns a plain dict shaped like ScreenResponse (minus imageWidth/Height/
    processingMs, which callers attach themselves). Shared by /screen (one
    photo) and /screen-video (many sampled frames)."""
    stages_run = ["vehicle_type"]

    # ---- Stage 1: vehicle type ----
    vehicle_results = vehicle_model.predict(image, conf=VEHICLE_CONF_THRESHOLD, verbose=False)[0]
    vehicle_detections = _to_detections(vehicle_results, vehicle_model)

    two_wheeler_hits = [d for d in vehicle_detections if d.label in TWO_WHEELER_LABELS]
    is_two_wheeler = len(two_wheeler_hits) > 0

    if not vehicle_detections:
        eligibility_message = "No vehicle detected in this photo."
    elif is_two_wheeler:
        eligibility_message = (
            f"Two-wheeler detected ({two_wheeler_hits[0].label}, "
            f"{round(two_wheeler_hits[0].confidence * 100)}% confidence)."
        )
    else:
        other_labels = sorted({d.label for d in vehicle_detections})
        eligibility_message = (
            f"Detected {', '.join(other_labels)} — this platform only screens two-wheeler "
            "(motorcycle/scooter) violations."
        )

    helmet_detections: List[Detection] = []
    rider_counts: List[RiderCount] = []
    plate_detections: List[Detection] = []
    plate_previews: List[str] = []
    suggested: List[str] = []

    # ---- Stage 2: helmet + triple-riding — only if a two-wheeler was found ----
    if is_two_wheeler:
        stages_run.append("helmet")
        helmet_results = helmet_model.predict(image, conf=HELMET_CONF_THRESHOLD, verbose=False)[0]
        helmet_detections = _to_detections(helmet_results, helmet_model)

        has_no_helmet = any(
            d.label == "no_helmet" and d.confidence >= VIOLATION_CONF_THRESHOLD for d in helmet_detections
        )
        if has_no_helmet:
            suggested.append("No Helmet")

        stages_run.append("triple_riding")
        person_results = person_model.predict(
            image, conf=PERSON_CONF_THRESHOLD, classes=[COCO_PERSON_CLASS], verbose=False
        )[0]
        person_boxes = [b.xyxy[0].tolist() for b in person_results.boxes]

        has_triple_riding = False
        for hit in two_wheeler_hits:
            region = _expand_box(hit.box)
            count = sum(1 for p in person_boxes if _box_center_inside(p, region))
            is_violation = count >= TRIPLE_RIDING_MIN_COUNT
            has_triple_riding = has_triple_riding or is_violation
            rider_counts.append(RiderCount(vehicleBox=hit.box, riderCount=count, isViolation=is_violation))

        if has_triple_riding:
            suggested.append("Triple Riding")

        # ---- Stage 3: plate — only if Stage 2 found any violation ----
        if suggested:
            stages_run.append("plate")
            plate_results = plate_model.predict(image, conf=PLATE_CONF_THRESHOLD, verbose=False)[0]
            plate_detections = _to_detections(plate_results, plate_model)
            plate_previews = [_crop_base64(image, d.box) for d in plate_detections]

    # ---- Final result: one unambiguous status + message, plus the annotated image ----
    if not vehicle_detections:
        result_status = "NO_VEHICLE"
        result_message = "No vehicle detected in this photo."
    elif not is_two_wheeler:
        result_status = "NOT_TWO_WHEELER"
        result_message = eligibility_message
    elif not suggested:
        result_status = "NO_VIOLATION"
        result_message = "No violations detected."
    elif not plate_detections:
        result_status = "VIOLATION_NO_PLATE"
        result_message = "Violation detected, but the number plate could not be detected."
    else:
        result_status = "VIOLATION_WITH_PLATE"
        result_message = f"Violation detected: {', '.join(suggested)}. Number plate located below."

    annotated_image_base64 = _annotate_image(image, vehicle_detections, helmet_detections, plate_detections)

    return {
        "vehicleDetections": vehicle_detections,
        "isTwoWheeler": is_two_wheeler,
        "eligibilityMessage": eligibility_message,
        "helmetDetections": helmet_detections,
        "riderCounts": rider_counts,
        "plateDetections": plate_detections,
        "platePreviewsBase64": plate_previews,
        "suggestedViolations": suggested,
        "stagesRun": stages_run,
        "resultStatus": result_status,
        "resultMessage": result_message,
        "annotatedImageBase64": annotated_image_base64,
    }


@app.post("/screen", response_model=ScreenResponse)
async def screen(file: UploadFile = File(...)):
    if load_error:
        raise HTTPException(status_code=503, detail=f"Models failed to load: {load_error}")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image")

    start = time.time()
    raw = await file.read()

    try:
        image = Image.open(io.BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read image file")

    result = _run_pipeline(image)

    return ScreenResponse(
        imageWidth=image.width,
        imageHeight=image.height,
        processingMs=int((time.time() - start) * 1000),
        **result,
    )


class VideoViolationHit(BaseModel):
    timestampSec: float
    frameBase64: str
    isTwoWheeler: bool
    helmetDetections: List[Detection]
    riderCounts: List[RiderCount]
    plateDetections: List[Detection]
    platePreviewsBase64: List[str]
    suggestedViolations: List[str]
    resultStatus: str
    resultMessage: str


class VideoScreenResponse(BaseModel):
    durationSec: float
    framesSampled: int
    violations: List[VideoViolationHit]
    truncated: bool  # true if MAX_VIDEO_VIOLATIONS_RETURNED was hit before the video ended
    processingMs: int


@app.post("/screen-video", response_model=VideoScreenResponse)
async def screen_video(file: UploadFile = File(...)):
    """Samples up to MAX_VIDEO_SAMPLES frames evenly across the video's
    duration and runs each through the same staged pipeline as /screen.
    Only frames that actually produced a suggested violation are returned
    (with the frame image itself, so the review queue has real evidence to
    show) — most sampled frames won't have anything to report and are
    discarded immediately rather than returned."""
    if load_error:
        raise HTTPException(status_code=503, detail=f"Models failed to load: {load_error}")

    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a video")

    start = time.time()
    raw = await file.read()

    suffix = os.path.splitext(file.filename or "upload.mp4")[1] or ".mp4"
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
            tmp.write(raw)
            tmp_path = tmp.name

        cap = cv2.VideoCapture(tmp_path)
        if not cap.isOpened():
            raise HTTPException(status_code=400, detail="Could not read video file")

        fps = cap.get(cv2.CAP_PROP_FPS) or 25.0
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration_sec = (total_frames / fps) if fps else 0.0

        if total_frames <= 0:
            cap.release()
            raise HTTPException(status_code=400, detail="Video appears to have no readable frames")

        num_samples = max(1, min(MAX_VIDEO_SAMPLES, total_frames))
        frame_indices = sorted({int(i * total_frames / num_samples) for i in range(num_samples)})

        violations: List[VideoViolationHit] = []
        frames_checked = 0
        truncated = False

        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame_bgr = cap.read()
            if not ret:
                continue
            frames_checked += 1

            frame_rgb = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2RGB)
            image = Image.fromarray(frame_rgb)
            result = _run_pipeline(image)

            if result["suggestedViolations"]:
                violations.append(
                    VideoViolationHit(
                        timestampSec=round(idx / fps, 2),
                        frameBase64=result["annotatedImageBase64"],
                        isTwoWheeler=result["isTwoWheeler"],
                        helmetDetections=result["helmetDetections"],
                        riderCounts=result["riderCounts"],
                        plateDetections=result["plateDetections"],
                        platePreviewsBase64=result["platePreviewsBase64"],
                        suggestedViolations=result["suggestedViolations"],
                        resultStatus=result["resultStatus"],
                        resultMessage=result["resultMessage"],
                    )
                )

                if len(violations) >= MAX_VIDEO_VIOLATIONS_RETURNED:
                    truncated = True
                    break

        cap.release()
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

    return VideoScreenResponse(
        durationSec=round(duration_sec, 1),
        framesSampled=frames_checked,
        violations=violations,
        truncated=truncated,
        processingMs=int((time.time() - start) * 1000),
    )
