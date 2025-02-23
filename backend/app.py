from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from ultralytics import YOLO
import cv2
import os
import subprocess
import traceback

app = FastAPI()

# Serve processed videos
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Load YOLOv8 model
model = YOLO("yolov8n.pt")

@app.post("/process-video")
async def process_video(file: UploadFile = File(...)):
    try:
        # Validate video format
        if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
            return JSONResponse({"error": "Invalid video format. Only .mp4, .avi, .mov are supported."}, status_code=400)

        # Ensure directories exist
        os.makedirs("uploads", exist_ok=True)
        os.makedirs("outputs", exist_ok=True)

        # Save uploaded video
        video_path = os.path.abspath(f"uploads/{file.filename}")
        with open(video_path, "wb") as buffer:
            buffer.write(await file.read())

        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return JSONResponse({"error": "Failed to open video file."}, status_code=500)

        # Define paths
        temp_output_path = os.path.abspath(f"outputs/temp_{file.filename}")  # Temporary processed video
        final_output_path = os.path.abspath(f"outputs/{file.filename}")  # H.264 converted video

        # Initialize VideoWriter (Keep MP4 format before conversion)
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")  # Use 'mp4v' for MP4 format
        out = cv2.VideoWriter(
            temp_output_path,
            fourcc,
            cap.get(cv2.CAP_PROP_FPS),
            (int(cap.get(3)), int(cap.get(4))),
        )

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            
            # Process frame with YOLO
            results = model(frame)
            annotated_frame = results[0].plot()
            out.write(annotated_frame)
            cv2.imshow('Vehicle Detection', annotated_frame)
            cv2.waitKey(1)

        # Release resources
        cap.release()
        out.release()

        # Convert to H.264 using FFmpeg
        ffmpeg_cmd = f'ffmpeg -i "{temp_output_path}" -c:v libx264 -preset slow -crf 23 "{final_output_path}" -y'
        result = subprocess.run(ffmpeg_cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        # Check if FFmpeg executed successfully
        if result.returncode != 0:
            print("FFmpeg Error:", result.stderr)
            return JSONResponse({"error": "FFmpeg processing failed", "details": result.stderr}, status_code=500)

        # Delete temporary file
        os.remove(temp_output_path)

        return JSONResponse({
            "message": "Video processed and converted to H.264 successfully",
            "output_path": f"/outputs/{file.filename}"
        })

    except Exception as e:
        print("Error during video processing:", traceback.format_exc())
        return JSONResponse({"error": "Internal Server Error"}, status_code=500)
