"""
Two-Wheeler Traffic Violation Detection Pipeline
=================================================
Accepts an image OR a video as input. Videos are sampled at a fixed rate
(default 6 fps) and each resulting frame is run through the same pipeline
used for images.

Pipeline per frame:
    1. Detect motorcycles + persons (vehicle_object_detection.pt)
    2. Associate persons -> motorcycles (containment / IoU overlap)
    3. Flag violations:
         - "Triple Riding"  -> more than 2 riders on one bike
         - "No Helmet"      -> any rider without a detected helmet
    4. If any violation found, crop the bike and read its plate
       (plate_detector.pt + EasyOCR)
    5. POST the violation (plate number, violation list, snapshot image)
       to the backend, with a per-plate/violation cooldown to avoid spam.

Usage:
    python model_workflow.py <input_path> <api_url> <token> [--model-dir DIR] [--fps N]

Backend payload is unchanged from the original script:
    data:  {"plateNumber": str, "violations": json-encoded list[str]}
    files: {"evidenceImage": ("snapshot.jpg", <bytes>, "image/jpeg")}
    headers: {"x-webhook-secret": token}
"""

import argparse
import json
import logging
import os
import sys
import tempfile
import time
from dataclasses import dataclass
from pathlib import Path

import cv2
import requests
from ultralytics import YOLO
import easyocr

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
log = logging.getLogger("violation_detector")

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".bmp", ".webp"}
VIDEO_EXTS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


# --------------------------------------------------------------------------- #
# Config
# --------------------------------------------------------------------------- #
@dataclass
class Config:
    model_dir: Path
    api_url: str
    api_token: str
    sample_fps: float = 6.0
    vehicle_conf: float = 0.25
    helmet_conf: float = 0.5
    plate_conf: float = 0.3
    rider_overlap_iou: float = 0.25
    max_riders_legal: int = 2
    violation_cooldown_sec: float = 10.0
    vehicle_labels: tuple = ("motor", "bike", "two-wheeler")
    person_labels: tuple = ("person", "rider", "human")


# --------------------------------------------------------------------------- #
# Geometry helpers
# --------------------------------------------------------------------------- #
def iou(box1, box2) -> float:
    x1, y1 = max(box1[0], box2[0]), max(box1[1], box2[1])
    x2, y2 = min(box1[2], box2[2]), min(box1[3], box2[3])
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    a1 = (box1[2] - box1[0]) * (box1[3] - box1[1])
    a2 = (box2[2] - box2[0]) * (box2[3] - box2[1])
    denom = a1 + a2 - inter
    return inter / denom if denom > 0 else 0.0


def intersection_over_person_area(bike_box, person_box) -> float:
    x1, y1 = max(bike_box[0], person_box[0]), max(bike_box[1], person_box[1])
    x2, y2 = min(bike_box[2], person_box[2]), min(bike_box[3], person_box[3])
    inter = max(0, x2 - x1) * max(0, y2 - y1)
    p_area = (person_box[2] - person_box[0]) * (person_box[3] - person_box[1])
    return inter / p_area if p_area > 0 else 0.0


def center(box):
    return (box[0] + box[2]) / 2, (box[1] + box[3]) / 2


def clamp_box(box, w, h, pad=0):
    x1, y1, x2, y2 = box
    return (max(0, x1 - pad), max(0, y1 - pad), min(w, x2 + pad), min(h, y2 + pad))


# --------------------------------------------------------------------------- #
# Models
# --------------------------------------------------------------------------- #
class ModelBundle:
    """Loads and holds the three YOLO models plus the OCR reader."""

    def __init__(self, model_dir: Path):
        log.info("Loading vehicle detection model...")
        self.vehicle = YOLO(str(model_dir / "vehicle_object_detection.pt"))
        log.info("Loading helmet detection model...")
        self.helmet = YOLO(str(model_dir / "helmet.pt"))
        log.info("Loading plate detection model...")
        self.plate = YOLO(str(model_dir / "plate_detector.pt"))
        log.info("Loading OCR reader...")
        self.ocr = easyocr.Reader(["en", "ne"], gpu=False)


# --------------------------------------------------------------------------- #
# Frame source: image -> single frame, video -> sampled frames
# --------------------------------------------------------------------------- #
class FrameSource:
    """Yields frames from either a single image or a video sampled at a fixed fps."""

    def __init__(self, path: str, sample_fps: float):
        self.path = path
        self.sample_fps = sample_fps
        self.ext = Path(path).suffix.lower()
        if self.ext not in IMAGE_EXTS | VIDEO_EXTS:
            raise ValueError(f"Unsupported file type: {self.ext}")

    def __iter__(self):
        if self.ext in IMAGE_EXTS:
            frame = cv2.imread(self.path)
            if frame is None:
                raise IOError(f"Could not read image: {self.path}")
            yield 0, frame
            return

        cap = cv2.VideoCapture(self.path)
        if not cap.isOpened():
            raise IOError(f"Could not open video: {self.path}")

        src_fps = cap.get(cv2.CAP_PROP_FPS) or 30
        step = max(1, round(src_fps / self.sample_fps))

        idx = 0
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            if idx % step == 0:
                yield idx, frame
            idx += 1
        cap.release()


# --------------------------------------------------------------------------- #
# Core detection pipeline
# --------------------------------------------------------------------------- #
class ViolationDetector:
    def __init__(self, cfg: Config, models: ModelBundle):
        self.cfg = cfg
        self.models = models
        self._cooldowns = {}
        self._reported_track_ids = set()

    def _detect_vehicles_and_persons(self, frame):
        motorcycles, persons = [], []
        h, w = frame.shape[:2]
        
        # Use ByteTrack for object tracking
        results = self.models.vehicle.track(frame, tracker="bytetrack.yaml", persist=True, verbose=False)
        
        for r in results:
            if r.boxes is None: continue
            
            ids = r.boxes.id.cpu().numpy() if r.boxes.id is not None else [None] * len(r.boxes)
            
            for box, track_id in zip(r.boxes, ids):
                conf = float(box.conf[0])
                if conf < self.cfg.vehicle_conf:
                    continue
                name = self.models.vehicle.names[int(box.cls[0])].lower()
                xyxy = tuple(map(int, box.xyxy[0]))
                
                # Filter out absurdly large boxes (e.g. width > 80% of frame)
                box_w = xyxy[2] - xyxy[0]
                if box_w > w * 0.8:
                    continue
                
                if any(k in name for k in self.cfg.vehicle_labels):
                    motorcycles.append({"box": xyxy, "track_id": track_id})
                elif any(k in name for k in self.cfg.person_labels):
                    persons.append(xyxy)
        return motorcycles, persons

    def _riders_on_bike(self, bike_box, persons):
        riders = []
        for p in persons:
            px, py = center(p)
            inside = bike_box[0] <= px <= bike_box[2] and bike_box[1] <= py <= bike_box[3]
            if inside or intersection_over_person_area(bike_box, p) > self.cfg.rider_overlap_iou:
                riders.append(p)
        return riders

    def _has_helmet(self, frame, rider_box):
        h, w = frame.shape[:2]
        x1, y1, x2, y2 = clamp_box(rider_box, w, h, pad=10)
        if x2 <= x1 or y2 <= y1:
            return False
        crop = frame[y1:y2, x1:x2]
        for r in self.models.helmet(crop, verbose=False):
            for box in r.boxes:
                name = self.models.helmet.names[int(box.cls[0])].lower()
                if name == "helmet" and float(box.conf[0]) > self.cfg.helmet_conf:
                    return True
        return False

    def _read_plate(self, frame, bike_box):
        h, w = frame.shape[:2]
        x1, y1, x2, y2 = clamp_box(bike_box, w, h, pad=20)
        bike_crop = frame[y1:y2, x1:x2]

        for r in self.models.plate(bike_crop, verbose=False):
            for box in r.boxes:
                if float(box.conf[0]) <= self.cfg.plate_conf:
                    continue
                px1, py1, px2, py2 = map(int, box.xyxy[0])
                plate_crop = bike_crop[py1:py2, px1:px2]
                ocr_result = self.models.ocr.readtext(plate_crop)
                if ocr_result:
                    text = "".join(res[1] for res in ocr_result)
                    return text.replace(" ", "").upper()
                return "UNKNOWN"
        return "UNKNOWN"

    def _should_send(self, plate_text, violations, track_id=None):
        if track_id is not None:
            # Deduplicate by track_id for videos
            if track_id in self._reported_track_ids:
                return False
            self._reported_track_ids.add(track_id)
            return True
            
        # Fallback to cooldown logic if tracking fails (e.g. single images)
        key = f"{plate_text}_{'-'.join(sorted(violations))}"
        now = time.time()
        last = self._cooldowns.get(key)
        if last is not None and (now - last) < self.cfg.violation_cooldown_sec:
            return False
        self._cooldowns[key] = now
        return True

    def _report(self, frame, bike_box, plate_text, violations, no_helmet_boxes):
        snap = frame.copy()
        x1, y1, x2, y2 = bike_box
        
        # Draw bike box (blue)
        cv2.rectangle(snap, (x1, y1), (x2, y2), (255, 0, 0), 2)
        cv2.putText(snap, f"{plate_text} - {', '.join(violations)}", (x1, max(0, y1 - 10)),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 0, 0), 2)

        # Draw no-helmet rider boxes (red)
        for r_box in no_helmet_boxes:
            rx1, ry1, rx2, ry2 = r_box
            cv2.rectangle(snap, (rx1, ry1), (rx2, ry2), (0, 0, 255), 2)
            cv2.putText(snap, "No Helmet", (rx1, max(0, ry1 - 10)),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)

        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp_path = tmp.name
        cv2.imwrite(tmp_path, snap)

        try:
            headers = {"x-webhook-secret": self.cfg.api_token}
            data = {"plateNumber": plate_text, "violations": json.dumps(list(violations))}
            with open(tmp_path, "rb") as f:
                files = {"evidenceImage": ("snapshot.jpg", f, "image/jpeg")}
                res = requests.post(self.cfg.api_url, headers=headers, data=data, files=files, timeout=15)
            log.info("Backend response: %s - %s", res.status_code, res.text)
        except Exception as e:
            log.error("Failed to send violation to backend: %s", e)
        finally:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

    def process_frame(self, frame):
        motorcycles, persons = self._detect_vehicles_and_persons(frame)
        log.info("Detected %d motorcycles, %d persons", len(motorcycles), len(persons))

        for bike in motorcycles:
            bike_box = bike["box"]
            track_id = bike["track_id"]
            
            riders = self._riders_on_bike(bike_box, persons)
            violations = set()
            no_helmet_boxes = []

            if len(riders) > self.cfg.max_riders_legal:
                violations.add("Triple Riding")

            for rider_box in riders:
                if not self._has_helmet(frame, rider_box):
                    violations.add("No Helmet")
                    no_helmet_boxes.append(rider_box)

            if not violations:
                continue

            plate_text = self._read_plate(frame, bike_box)

            if self._should_send(plate_text, violations, track_id):
                log.info("Violation: plate=%s violations=%s", plate_text, list(violations))
                self._report(frame, bike_box, plate_text, violations, no_helmet_boxes)

    def process_source(self, path: str):
        source = FrameSource(path, self.cfg.sample_fps)
        n = 0
        for idx, frame in source:
            n += 1
            log.info("Processing frame %d (source index %d)", n, idx)
            self.process_frame(frame)
        log.info("Done. Processed %d frame(s).", n)


# --------------------------------------------------------------------------- #
# CLI
# --------------------------------------------------------------------------- #
def parse_args():
    p = argparse.ArgumentParser(description="Two-wheeler violation detection pipeline")
    p.add_argument("input", help="Path to an image or video file")
    p.add_argument("api_url", help="Backend endpoint to POST violations to")
    p.add_argument("token", help="Webhook secret token")
    p.add_argument("--model-dir", default=None, help="Directory containing the .pt model files")
    p.add_argument("--fps", type=float, default=6.0, help="Sampling rate for video frame extraction (default: 6)")
    return p.parse_args()


def main():
    args = parse_args()

    model_dir = Path(args.model_dir) if args.model_dir else \
        Path(__file__).resolve().parent.parent / "models"

    if not model_dir.exists():
        log.error("Model directory not found: %s", model_dir)
        sys.exit(1)

    if not os.path.exists(args.input):
        log.error("Input file not found: %s", args.input)
        sys.exit(1)

    cfg = Config(model_dir=model_dir, api_url=args.api_url, api_token=args.token, sample_fps=args.fps)
    models = ModelBundle(model_dir)
    detector = ViolationDetector(cfg, models)

    log.info("Starting processing: %s", args.input)
    detector.process_source(args.input)


if __name__ == "__main__":
    main()