from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import cv2
import os

app = FastAPI()

# Serve files from the "outputs" directory
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Load YOLOv8 model
model = YOLO("yolov8n.pt")  # Use the appropriate YOLOv8 model

@app.post("/process-video")
async def process_video(file: UploadFile = File(...)):
    try:
        # Validate video format
        if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
            return JSONResponse({"error": "Invalid video format. Only .mp4, .avi, .mov are supported."}, status_code=400)

        # Save the uploaded video
        video_path = f"uploads/{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        with open(video_path, "wb") as buffer:
            buffer.write(await file.read())

        # Process the video with YOLOv8
        cap = cv2.VideoCapture(video_path)
        output_path = f"outputs/{file.filename}"
        os.makedirs("outputs", exist_ok=True)
        out = cv2.VideoWriter(
            output_path,
            cv2.VideoWriter_fourcc(*"mp4v"),
            cap.get(cv2.CAP_PROP_FPS),
            (int(cap.get(3)), int(cap.get(4))),
        )

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Run YOLOv8 inference
            results = model(frame)
            annotated_frame = results[0].plot()

            # Save the annotated frame
            out.write(annotated_frame)

        cap.release()
        out.release()
        
        print(f"Processed video saved to: {output_path}")

        # Return the correct output path URL
        return JSONResponse(
            {"message": "Video processed successfully", "output_path": f"/outputs/{file.filename}"}
        )
    
    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
