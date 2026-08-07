from ultralytics import YOLO

vehicle_object_detection = YOLO("vehicle_object_detection.pt")
print(vehicle_object_detection.names)