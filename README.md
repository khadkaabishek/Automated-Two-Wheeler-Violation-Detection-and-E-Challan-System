# Automated Two-Wheeler Violation Detection and E-Challan System

A Minor Project | Bachelor of Engineering in Information Technology
Nepal College of Information Technology, affiliated to Pokhara University

## Overview

Urban traffic management is increasingly challenged by rising vehicle density, limited enforcement resources, and growing road safety violations. This project is a **Smart Rider Monitoring & Violation Detection System** that uses real-time computer vision and deep learning to automatically identify traffic rule violations involving two-wheelers.

The system processes live CCTV/RTSP video streams through a modular AI pipeline to detect:

- **Helmet non-compliance**
- **Triple riding** (more than the permitted number of passengers)
- **Vehicle number plates**, via Automatic Number Plate Recognition (ANPR)

When a violation is confirmed, the system automatically generates evidence (images, timestamps, location metadata) and issues a digital **e-challan** to the vehicle owner.

## Key Features

- Real-time vehicle and rider detection from live video streams
- Helmet compliance detection
- Triple-riding detection via rider counting
- Automatic Number Plate Recognition (ANPR) using OCR
- Rule-based violation processing engine
- Automated evidence generation (image, timestamp, camera location, confidence score)
- Web-based monitoring dashboard for live violations and analytics
- Automated e-challan generation and notification (email/SMS with payment link)
- Human-in-the-loop verification by traffic police before challan issuance

## System Architecture

The system follows a modular pipeline:

1. **Video Acquisition** – capture live feed from CCTV/RTSP cameras
2. **Frame Extraction** – split the stream into individual frames
3. **Vehicle & Rider Detection** – YOLOv8-based object detection
4. **Helmet Detection** – classify helmet usage on detected riders
5. **Triple Riding Detection** – count riders per motorcycle
6. **Number Plate Detection & Recognition** – YOLOv8 for localization + EasyOCR/PaddleOCR for text extraction
7. **Violation Processing Engine** – rule-based evaluation of detected events
8. **Evidence Generation** – compile violation image, timestamp, and metadata
9. **Data Persistence** – store violation and vehicle records in a central database
10. **E-Challan Generation** – auto-generate digital fine notices
11. **Dashboard & Notifications** – display alerts/analytics and notify vehicle owners

Supporting design artifacts (see project report for diagrams): Use Case Diagram, ER Diagram, Class Diagram, Component Diagram, Sequence Diagram, and System Workflow / Gantt Chart.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Tailwind CSS |
| Backend | Node.js / Express.js (dashboard/API described as FastAPI in places of the report) |
| Database | SQL (relational) |
| Object Detection | YOLOv8 (YOLO family) |
| Tracking | ByteTrack / DeepSORT |
| OCR / ANPR | EasyOCR / PaddleOCR |
| ML Runtime | PyTorch, OpenCV |
| Notifications | Email gateway (SMS/Email with secure payment link) |
| Deployment | GPU acceleration; optional edge deployment (e.g., NVIDIA Jetson) |

> Note: The project report references both FastAPI and Node.js/Express for the backend in different sections — confirm and standardize on one before implementation.

## Datasets Used

| Dataset | Purpose | Source |
|---|---|---|
| Helmet Detection Project | Helmet detection | Roboflow Universe |
| Motorcycle-Rider Dataset | Motorcycle & rider detection | Roboflow Universe |
| Triple Ride Detection Dataset | Triple riding detection | Roboflow Universe |
| License Plate Recognition Dataset | Number plate detection | Roboflow Universe |
| License Plate Recognition (OCR) Dataset | OCR training/validation | Kaggle |
| Rider Using Mobile Detection Dataset | Mobile phone usage detection | Roboflow Universe |

Data split: 70% training / 20% validation / 10% testing, with augmentation (flipping, rotation, brightness, scaling, cropping).

## Functional Requirements (Summary)

- Real-time video ingestion from distributed cameras
- Automated violation screening (helmet, triple riding, etc.)
- Targeted ANPR triggered only after a violation is validated
- Challan suggestion with fine calculation and admin review/approval
- Automated SMS/Email notifications with secure payment links

## Non-Functional Requirements (Summary)

- Inference latency under 30ms per frame
- ANPR accuracy ≥ 95% across day/night/adverse weather
- Backend scalable to 500+ simultaneous camera feeds
- Evidence data encrypted with AES-256
- 99.9% system uptime (excluding scheduled maintenance)

## Project Scope

**In scope:** helmet compliance, triple-riding detection, ANPR-based vehicle identification, violation record storage, dashboard alerts and analytics.

**Out of scope:** overspeeding, signal jumping, illegal parking, and lane discipline enforcement.

## Limitations

- Accuracy may drop under poor lighting, rain, fog, or low-quality footage
- Occlusion from vehicles/pedestrians/congestion can affect detection
- Plate recognition accuracy depends on motion blur, damaged plates, or camera angle
- Performance depends on camera placement, resolution, and field of view
- Real-time processing may require dedicated GPU hardware
- Models may need periodic retraining across environments/vehicle types
- Currently limited to two-wheeler violations

## Project Timeline (12 Weeks)

| Week | Task |
|---|---|
| 1 | Requirement gathering & problem analysis |
| 2 | Dataset collection, inspection & preparation |
| 3 | System design & architecture planning |
| 4 | Database design & API planning |
| 5 | Vehicle & rider detection model development (YOLOv8) |
| 6 | Helmet & triple riding detection model development |
| 7 | Number plate detection & OCR integration |
| 8 | Backend API development & database integration |
| 9 | Frontend dashboard development |
| 10 | Violation processing engine & e-challan generation module |
| 11 | System integration, testing & debugging |
| 12 | Deployment, final report & presentation preparation |

## Team & Work Distribution

| Member | Responsibility |
|---|---|
| Abishek Khadka (231303) |  Machine Learning Development (Dataset Preparation, YOLOv8 Training, Helmet & Triple Riding Detection),Backend Development (E-Challan Generation, System Integration) |
| Ishbarna Kafle (231317) | Frontend Development (Dashboard UI) Backend Development (API, Database Design, Authentication, E-Challan Generation, System Integration) |
| Madan Belbase (231323) | Machine Learning Development (Dataset Preparation, YOLOv8 Training, ANPR & OCR Modules)  Backend Development (API, Database Design, Authentication,)|

## Expected Outcomes

- Automated, end-to-end violation detection pipeline reducing manual monitoring effort
- Low-latency admin dashboard for human-in-the-loop verification of citations
- Automated e-challan generation and delivery with transparent payment links
- A reliable, normalized database for violation records and audit trails

## Conclusion

This project demonstrates the design and architecture of an intelligent, end-to-end traffic control system that bridges automated computer-vision-based surveillance with legal enforcement — combining an AI detection pipeline with human-in-the-loop verification to improve accuracy, reduce manual oversight, and support safer road practices.

## References

See the full project report for the complete list of cited works on helmet violation detection, triple-riding detection, mobile phone usage detection, and ANPR systems.

---

*This README is derived from the project's minor project report ("Automated Two-Wheeler Violation Detection and E-Challan System"). Update the sections above (setup/installation, usage, folder structure, API endpoints) once implementation details are finalized.*
