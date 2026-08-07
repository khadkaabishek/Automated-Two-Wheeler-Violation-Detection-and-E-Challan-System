"""
Fetches (or refreshes) the person-detection model used for the
triple-riding heuristic from the official Ultralytics/YOLOv8 repo on
Hugging Face Hub, and saves it as models/person_yolov8n.pt.

You normally don't need to run this — a copy is already included in
models/. Run it if you want to pull a fresh copy, or swap in a different
size variant (yolov8s.pt, yolov8m.pt, etc. — larger is more accurate but
slower on CPU).

Usage:
    python fetch_person_model.py [filename]
    python fetch_person_model.py yolov8s.pt   # e.g. to use the small variant instead
"""

import shutil
import sys
from pathlib import Path

from huggingface_hub import hf_hub_download

REPO_ID = "Ultralytics/YOLOv8"
DEFAULT_FILENAME = "yolov8n.pt"
DEST = Path(__file__).parent / "models" / "person_yolov8n.pt"


def main():
    filename = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_FILENAME
    print(f"Downloading {filename} from {REPO_ID}...")
    downloaded_path = hf_hub_download(repo_id=REPO_ID, filename=filename)
    DEST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy(downloaded_path, DEST)
    print(f"Saved to {DEST}")


if __name__ == "__main__":
    main()
