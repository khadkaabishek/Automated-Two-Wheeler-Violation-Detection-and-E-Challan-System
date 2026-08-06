from ultralytics import YOLO

model = YOLO("yolov8m.pt")

model.predict(
    source="video.mp4",
    save=True,
    project=".",
    name="output"
)