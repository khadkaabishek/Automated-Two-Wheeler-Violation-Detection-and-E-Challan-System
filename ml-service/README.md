# E-Challan Two-Wheeler Violation Screening Service

A standalone Python/FastAPI service wrapping **four** models in a staged pipeline — nothing runs unconditionally on every photo. Handles both single photos (`/screen`) and video (`/screen-video`, which samples frames across the clip and runs each through the same pipeline).

| Stage | Model | Runs when | Detects |
|---|---|---|---|
| 1 | `vehicle_type_best.pt` | Always | 9 vehicle classes — screens for two-wheelers (motorcycle/scooter). This platform only handles two-wheeler violations, so everything else stops here. |
| 2a | `helmet_best.pt` | Only if Stage 1 found a two-wheeler | `helmet` / `no_helmet` |
| 2b | `person_yolov8n.pt` | Only if Stage 1 found a two-wheeler | Counts people near each detected two-wheeler → **Triple Riding** if 3 or more |
| 3 | `number_plate_detect_best.pt` | Only if Stage 2 found *any* violation | Plate location (not the characters — see below) |

## Setup — conda (recommended for Mac)

```bash
cd ml-service
conda env create -f environment.yml
conda activate echallan-ml
```

This works the same on Intel and Apple Silicon Macs — `pip` resolves the correct PyTorch build for your architecture automatically as part of installing `ultralytics`. No CUDA needed; everything here runs fine on CPU (Apple Silicon Macs can also use the `mps` backend automatically if you set `device="mps"` in the predict calls in `app/main.py`, though it's not required — these are small `nano`-sized models and CPU inference is already fast, well under a second per photo once warmed up).

**Not using conda?** Plain pip works too:
```bash
pip install -r requirements.txt
```

## Run

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

Then in `backend/.env`:
```
ML_SERVICE_URL=http://localhost:8000
```

## The four models

**`vehicle_type_best.pt`, `helmet_best.pt`, `number_plate_detect_best.pt`** — custom-trained YOLOv8 weights (see `ML/Code/` in the main repo for the training notebooks).

**`person_yolov8n.pt`** — the standard **Ultralytics/YOLOv8** COCO-pretrained nano model, sourced from Hugging Face: [huggingface.co/Ultralytics/YOLOv8](https://huggingface.co/Ultralytics/YOLOv8). A copy is already included in `models/`. To fetch a fresh copy or try a larger/more accurate variant:
```bash
python fetch_person_model.py              # re-fetches yolov8n.pt (default)
python fetch_person_model.py yolov8s.pt   # larger, more accurate, slower
```
It's used only for its `person` class (COCO class 0) — none of its other 79 COCO classes matter here.

## What triple-riding detection actually does — and its real limitation

There's no dedicated "triple riding" model (that's a fairly niche, region-specific violation type — nothing pretrained for it exists). Instead: for each detected two-wheeler, the region immediately around and above its bounding box is checked (expanded upward and sideways, since a tight vehicle box only covers the bike, not the people sitting on it), and every detected person whose center falls inside that region is counted. **Three or more → flagged.**

This is a **proximity heuristic**, not per-rider instance segmentation. It can occasionally miscount in a dense/crowded scene (e.g., a pedestrian standing right next to a stopped motorcycle), which is exactly why the response includes the raw `riderCounts` per vehicle — an officer reviewing a flagged detection sees the actual count and photo, not just a bare "violation" label, the same way every other suggestion from this service works.

## What it does — and doesn't — do

- Detects vehicle type, helmet status, rider count, and plate location.
- **Does not** read plate characters (no OCR trained) — an officer reads and types the plate themselves from the cropped preview.
- **Does not** issue or modify any citation. Every result is advisory; a human converts a flagged detection into an actual citation (or dismisses it) on the backend.

## Endpoints

### `GET /health`
Reports which of the four models loaded and their class lists.

### `POST /screen`
Multipart upload, field name `file` (image). Returns:
```json
{
  "imageWidth": 1920,
  "imageHeight": 1080,
  "vehicleDetections": [...],
  "isTwoWheeler": true,
  "eligibilityMessage": "Two-wheeler detected (motorcycle, 77% confidence).",
  "helmetDetections": [...],
  "riderCounts": [
    { "vehicleBox": [1546.5, 757.1, 1670.4, 893.1], "riderCount": 3, "isViolation": true }
  ],
  "plateDetections": [...],
  "platePreviewsBase64": ["..."],
  "suggestedViolations": ["No Helmet", "Triple Riding"],
  "stagesRun": ["vehicle_type", "helmet", "triple_riding", "plate"],
  "processingMs": 340
}
```

### `POST /screen-video`
Multipart upload, field name `file` (video — mp4/mov/webm/mpeg). Samples up to 60 frames evenly across the whole video and runs each through the exact same staged pipeline as `/screen`. Frames with nothing to report are discarded immediately; only frames that produced a confident violation are returned, each with its own captured image:
```json
{
  "durationSec": 13.8,
  "framesSampled": 60,
  "truncated": false,
  "processingMs": 29748,
  "violations": [
    {
      "timestampSec": 8.24,
      "frameBase64": "...",
      "isTwoWheeler": true,
      "helmetDetections": [...],
      "riderCounts": [...],
      "plateDetections": [...],
      "platePreviewsBase64": [...],
      "suggestedViolations": ["No Helmet"]
    }
  ]
}
```
`truncated: true` means it stopped early because it hit the cap of 12 returned violations before reaching the end of the video — there may be more.

This genuinely takes a while: each sampled frame runs the full pipeline sequentially, so a 14-second clip took ~30-45 seconds in testing on CPU. That's expected for a batch job, not a bug — there's no live/streaming mode here, just "upload, wait, get results."

## Getting better accuracy — swap in a larger open-source model

The person-detection model (`person_yolov8n.pt`) defaults to the smallest, fastest Ultralytics/YOLOv8 variant. If triple-riding detection is missing riders or the confidence scores feel low, swap in a larger variant from the same open-source Hugging Face repo — bigger and more accurate, at the cost of slower inference (which matters more for video, since it multiplies per frame):

```bash
python fetch_person_model.py yolov8s.pt   # small — better accuracy, still fast
python fetch_person_model.py yolov8m.pt   # medium — noticeably more accurate, noticeably slower on CPU
```

Same idea applies to the three custom-trained models if you retrain them at a larger size (`yolov8s`/`yolov8m` instead of `yolov8n`) — see the training notebooks under `ML/Code/` in the main repo.

## Common setup issue: NumPy / PyTorch / OpenCV version conflicts

If you see `RuntimeError: Numpy is not available` or `A module that was compiled using NumPy 1.x cannot be run in NumPy 2.x`, it's a real, common three-way version conflict, not a bug in this service:

- **Apple Silicon Macs**: `pip install --upgrade "numpy>=2" torch torchvision ultralytics` — modern PyTorch fully supports NumPy 2.x, so upgrading torch resolves it cleanly.
- **Intel Macs**: PyTorch dropped Intel Mac builds after version 2.2.x, so there's no newer torch to upgrade to — torch 2.2.2 is genuinely the latest available and it needs `numpy<2`. But `ultralytics` also pulls in `opencv-python`, and current `opencv-python` releases require `numpy>=2` — a direct conflict. Fix it by pinning an older `opencv-python` that's fine with `numpy<2` instead:
  ```bash
  pip install "numpy<2" "opencv-python<5"
  ```
  Verify both are happy before restarting the service:
  ```bash
  python -c "import torch, numpy; print(torch.from_numpy(numpy.array([1,2,3])))"
  python -c "import cv2; print(cv2.__version__)"
  ```
  Both need to run cleanly with no warnings before `uvicorn` will work correctly.

## Retraining / replacing the custom models

Training code for the three custom models is under `ML/Code/` in the main repo (Ultralytics YOLOv8, `model.train(...)`). Drop a new `.pt` into `models/` with the same filename, or update the path constants at the top of `app/main.py`, then restart — no backend changes needed as long as class names stay the same.
