import cv2
import os
import csv
import re
from datetime import datetime

from ultralytics import YOLO
import easyocr

# =====================================================
# CONFIG
# =====================================================

PLATE_MODEL = "plate_detector.pt"
VIDEO_PATH = "video.mp4"

PLATE_DIR = "plates"
EVIDENCE_DIR = "evidence"

CSV_FILE = "violations.csv"

os.makedirs(PLATE_DIR, exist_ok=True)
os.makedirs(EVIDENCE_DIR, exist_ok=True)

# =====================================================
# LOAD MODELS
# =====================================================

plate_detector = YOLO(PLATE_MODEL)

# English OCR
# You can later switch to PaddleOCR for better Nepali support
ocr = easyocr.Reader(['en'])

# =====================================================
# CSV HEADER
# =====================================================

if not os.path.exists(CSV_FILE):
    with open(CSV_FILE, "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow([
            "plate_number",
            "plate_image",
            "evidence_image",
            "timestamp"
        ])

# =====================================================
# DUPLICATE CONTROL
# =====================================================

seen_plates = set()
unknown_counter = 0

# =====================================================
# VIDEO
# =====================================================

cap = cv2.VideoCapture(VIDEO_PATH)

while cap.isOpened():

    ret, frame = cap.read()

    if not ret:
        break

    results = plate_detector(frame, verbose=False)

    for result in results:

        boxes = result.boxes.xyxy.cpu().numpy()

        for box in boxes:

            x1, y1, x2, y2 = map(int, box[:4])

            plate_crop = frame[y1:y2, x1:x2]

            if plate_crop.size == 0:
                continue

            # ==========================================
            # OCR
            # ==========================================

            ocr_results = ocr.readtext(plate_crop)

            plate_text = ""

            for item in ocr_results:
                plate_text += item[1] + " "

            plate_text = plate_text.strip()

            # Keep only letters and numbers
            plate_text = re.sub(
                r'[^A-Za-z0-9]',
                '',
                plate_text
            )

            # ==========================================
            # HANDLE OCR FAILURE
            # ==========================================

            if len(plate_text) < 4:

                unknown_counter += 1

                plate_text = (
                    f"UNKNOWN_{unknown_counter}"
                )

            # ==========================================
            # AVOID DUPLICATE SAVES
            # ==========================================

            if plate_text in seen_plates:
                continue

            seen_plates.add(plate_text)

            # ==========================================
            # FILE PATHS
            # ==========================================

            timestamp = datetime.now().strftime(
                "%Y-%m-%d_%H-%M-%S"
            )

            plate_file = (
                f"{PLATE_DIR}/{plate_text}.png"
            )

            evidence_file = (
                f"{EVIDENCE_DIR}/{plate_text}.png"
            )

            # ==========================================
            # SAVE PLATE CROP
            # ==========================================

            cv2.imwrite(
                plate_file,
                plate_crop
            )

            # ==========================================
            # SAVE EVIDENCE IMAGE
            # ==========================================

            evidence_frame = frame.copy()

            cv2.rectangle(
                evidence_frame,
                (x1, y1),
                (x2, y2),
                (0, 0, 255),
                3
            )

            cv2.putText(
                evidence_frame,
                plate_text,
                (x1, max(y1 - 10, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.8,
                (0, 0, 255),
                2
            )

            cv2.imwrite(
                evidence_file,
                evidence_frame
            )

            # ==========================================
            # SAVE CSV RECORD
            # ==========================================

            with open(
                CSV_FILE,
                "a",
                newline=""
            ) as f:

                writer = csv.writer(f)

                writer.writerow([
                    plate_text,
                    plate_file,
                    evidence_file,
                    timestamp
                ])

            print(
                f"[SAVED] {plate_text}"
            )

            # ==========================================
            # DISPLAY ON SCREEN
            # ==========================================

            cv2.rectangle(
                frame,
                (x1, y1),
                (x2, y2),
                (0, 255, 0),
                2
            )

            cv2.putText(
                frame,
                plate_text,
                (x1, max(y1 - 10, 20)),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.7,
                (0, 255, 0),
                2
            )

    cv2.imshow(
        "Nepal License Plate Detection",
        frame
    )

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()

print("\nDone.")
print(f"Plate crops saved in: {PLATE_DIR}/")
print(f"Evidence images saved in: {EVIDENCE_DIR}/")
print(f"CSV saved as: {CSV_FILE}")