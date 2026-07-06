import os
from ultralytics import YOLO

def train_helmet_model():
    # 1. Initialize a base YOLOv8 model. 
    # 'yolov8n.pt' (nano) or 'yolov8s.pt' (small) are ideal for real-time traffic edge deployment.
    model = YOLO('yolov8n.pt')

    # 2. Path to the configuration file we created in Step 1
    yaml_path = os.path.abspath('dataset.yaml')

    print(f"Starting YOLOv8 training using config: {yaml_path}")

    # 3. Kick off training
    model.train(
        data=yaml_path,     # Path to your dataset specification file
        epochs=50,          # Number of training epochs (adjust based on your timeline/GPU)
        imgsz=640,          # Standard image size for training and inference
        batch=16,           # Batch size (set to 8 or 32 depending on your GPU VRAM)
        device=0,           # Use device=0 for CUDA GPU, or device='cpu' if you don't have a dedicated GPU
        workers=4,          # Number of CPU workers for loading data
        project='helmet_detection', # Saves runs to a folder named 'helmet_detection'
        name='yolov8_run'   # Subfolder name for this specific training session
    )

if __name__ == "__main__":
    train_helmet_model()