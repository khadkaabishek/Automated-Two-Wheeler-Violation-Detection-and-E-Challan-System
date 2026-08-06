import sys
import cv2
import os
import requests
import json
from ultralytics import YOLO
import easyocr
import time

def compute_iou(box1, box2):
    """Compute Intersection over Union (IoU) of two bounding boxes."""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])

    inter_area = max(0, x2 - x1) * max(0, y2 - y1)
    box1_area = (box1[2] - box1[0]) * (box1[3] - box1[1])
    box2_area = (box2[2] - box2[0]) * (box2[3] - box2[1])

    iou = inter_area / float(box1_area + box2_area - inter_area)
    return iou

def get_center(box):
    return ((box[0] + box[2]) / 2, (box[1] + box[3]) / 2)

def main(video_path, api_url, token):
    print(f"Starting processing on video: {video_path}")
    
    # Load Models
    model_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'models'))
    vehicle_model = YOLO(os.path.join(model_dir, 'vehicle_object_detection.pt'))
    helmet_model = YOLO(os.path.join(model_dir, 'helmet.pt'))
    plate_model = YOLO(os.path.join(model_dir, 'plate_detector.pt'))
    
    # Initialize OCR
    print("Initializing EasyOCR...")
    reader = easyocr.Reader(['en', 'ne'], gpu=False) # 'ne' for Nepali, 'en' for english digits
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        print(f"Error opening video file {video_path}")
        sys.exit(1)

    fps = cap.get(cv2.CAP_PROP_FPS)
    if fps <= 0: fps = 30
    
    # Process 5 frames per second to save computation
    frame_skip = int(fps / 5)
    if frame_skip == 0: frame_skip = 1

    frame_count = 0
    cooldowns = {} # Track recent detected plates to avoid spamming the backend

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
            
        frame_count += 1
        if frame_count % frame_skip != 0:
            continue

        # 1. Detect motorcycles and persons
        vehicle_results = vehicle_model(frame, verbose=False)
        
        motorcycles = []
        persons = []
        
        for r in vehicle_results:
            boxes = r.boxes
            for box in boxes:
                cls_id = int(box.cls[0])
                cls_name = vehicle_model.names[cls_id]
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                
                if conf < 0.5: continue
                
                if cls_name in ['motorcycle', 'Motorcycle']:
                    motorcycles.append((x1, y1, x2, y2))
                elif cls_name in ['person', 'Person', 'rider']:
                    persons.append((x1, y1, x2, y2))

        # 2. Associate persons with motorcycles
        for m_box in motorcycles:
            riders_on_this_bike = []
            for p_box in persons:
                # Check if person center is within motorcycle bounding box, or high IoU
                px, py = get_center(p_box)
                if m_box[0] <= px <= m_box[2] and m_box[1] <= py <= m_box[3]:
                    riders_on_this_bike.append(p_box)
                else:
                    iou = compute_iou(m_box, p_box)
                    if iou > 0.1: # some overlap
                        riders_on_this_bike.append(p_box)

            violations = set()
            
            # Check Triple Riding
            if len(riders_on_this_bike) > 2:
                violations.add("Triple Riding")

            # Check Helmets
            for rider_box in riders_on_this_bike:
                # Crop rider for helmet detection
                rx1, ry1, rx2, ry2 = rider_box
                # Add padding
                rx1 = max(0, rx1 - 10)
                ry1 = max(0, ry1 - 10)
                rx2 = min(frame.shape[1], rx2 + 10)
                ry2 = min(frame.shape[0], ry2 + 10)
                
                if rx2 <= rx1 or ry2 <= ry1: continue
                
                rider_crop = frame[ry1:ry2, rx1:rx2]
                
                helmet_results = helmet_model(rider_crop, verbose=False)
                has_helmet = False
                
                for hr in helmet_results:
                    for h_box in hr.boxes:
                        h_cls_name = helmet_model.names[int(h_box.cls[0])]
                        if 'helmet' in h_cls_name.lower():
                            if float(h_box.conf[0]) > 0.5:
                                has_helmet = True
                                break
                    if has_helmet: break
                
                if not has_helmet:
                    violations.add("No Helmet")

            # 3. If violation found, process number plate and send
            if len(violations) > 0:
                # Crop motorcycle for plate detection
                mx1, my1, mx2, my2 = m_box
                mx1 = max(0, mx1 - 20)
                my1 = max(0, my1 - 20)
                mx2 = min(frame.shape[1], mx2 + 20)
                my2 = min(frame.shape[0], my2 + 20)
                
                bike_crop = frame[my1:my2, mx1:mx2]
                
                plate_results = plate_model(bike_crop, verbose=False)
                plate_text = "UNKNOWN"
                
                for pr in plate_results:
                    for p_box in pr.boxes:
                        if float(p_box.conf[0]) > 0.4:
                            px1, py1, px2, py2 = map(int, p_box.xyxy[0])
                            plate_crop = bike_crop[py1:py2, px1:px2]
                            
                            # Run EasyOCR
                            ocr_result = reader.readtext(plate_crop)
                            if len(ocr_result) > 0:
                                # concatenate texts
                                plate_text = "".join([res[1] for res in ocr_result]).replace(" ", "").upper()
                            break # Just take the first plate found on this bike

                # Send to backend
                current_time = time.time()
                # Simple cooldown to avoid sending the same plate/violation 10 times a second
                cooldown_key = f"{plate_text}_{'-'.join(sorted(list(violations)))}"
                
                if cooldown_key not in cooldowns or (current_time - cooldowns[cooldown_key]) > 10:
                    cooldowns[cooldown_key] = current_time
                    
                    print(f"Violation detected! Plate: {plate_text}, Violations: {list(violations)}")
                    
                    # Draw boxes for the snapshot
                    snap_frame = frame.copy()
                    cv2.rectangle(snap_frame, (m_box[0], m_box[1]), (m_box[2], m_box[3]), (0, 0, 255), 2)
                    cv2.putText(snap_frame, f"{plate_text} - {', '.join(violations)}", (m_box[0], m_box[1] - 10), 
                                cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
                    
                    # Save temporary snapshot
                    temp_img_path = f"/tmp/violation_snap_{int(current_time)}.jpg"
                    cv2.imwrite(temp_img_path, snap_frame)
                    
                    # Make API request
                    try:
                        headers = {"Authorization": f"Bearer {token}"}
                        data = {
                            "plateNumber": plate_text,
                            "violations": json.dumps(list(violations))
                        }
                        files = {
                            "evidenceImage": ("snapshot.jpg", open(temp_img_path, "rb"), "image/jpeg")
                        }
                        
                        res = requests.post(api_url, headers=headers, data=data, files=files)
                        print(f"Backend response: {res.status_code} - {res.text}")
                    except Exception as e:
                        print(f"Failed to send to backend: {str(e)}")
                    finally:
                        if os.path.exists(temp_img_path):
                            os.remove(temp_img_path)

    cap.release()
    print("Video processing complete.")

if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python model_workflow.py <video_path> <api_url> <token>")
        sys.exit(1)
        
    v_path = sys.argv[1]
    a_url = sys.argv[2]
    t = sys.argv[3]
    
    main(v_path, a_url, t)
