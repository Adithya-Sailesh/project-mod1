from fastapi import FastAPI, File, UploadFile, WebSocket
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import cv2
import os
import subprocess
import traceback
from inference import get_model
import supervision as sv
import pytesseract  
import logging
import uuid
import re  # For number plate validation
import requests
# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Serve processed videos
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Load Roboflow model
API_KEY = os.getenv("ROBOFLOW_API_KEY", "ru9Ag6REQG3256Iqf4Km")
model = get_model(model_id="number_plate-4v9tn/1", api_key=API_KEY)








# WebSocket connection
connected_clients = set()
valid_number_plates = set()  # Store valid plates

import re

# List of valid Indian state codes
INDIAN_STATE_CODES = {
    "AP", "AR", "AS", "BR", "CG", "GA", "GJ", "HR", "HP", "JH", "KA", "KL", 
    "MP", "MH", "MN", "ML", "MZ", "NL", "OD", "PB", "RJ", "SK", "TN", "TS", 
    "TR", "UP", "UK", "WB", "AN", "CH", "DN", "DD", "DL", "LD", "PY"
}

def is_valid_indian_plate(text):
    # Regex pattern for Indian number plate format
    pattern = r"^[A-Z]{2}\d{1,2}[A-Z]{1,2}\d{1,4}$"
    
    # Check if the text matches the format
    if not re.match(pattern, text):
        return False
    
    # Extract the state code (first two characters)
    state_code = text[:2]
    # if state_code=="KU" :
    #     state_code="KL"
    # Check if the state code is valid
    return state_code in INDIAN_STATE_CODES

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_clients.add(websocket)
    try:
        while True:
            await websocket.receive_text()  
    except Exception as e:
        logging.error(f"WebSocket error: {e}")
    finally:
        connected_clients.remove(websocket)


@app.post("/process-video")
async def process_video(file: UploadFile = File(...)):
    valid_number_plates = set()
    try:
        if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
            return JSONResponse({"error": "Invalid video format. Only .mp4, .avi, .mov are supported."}, status_code=400)

        os.makedirs("uploads", exist_ok=True)
        os.makedirs("outputs", exist_ok=True)

        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        video_path = os.path.abspath(f"uploads/{unique_filename}")

        with open(video_path, "wb") as buffer:
            buffer.write(await file.read())

        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return JSONResponse({"error": "Failed to open video file."}, status_code=500)

        temp_output_path = os.path.abspath(f"outputs/temp_{unique_filename}")  
        final_output_path = os.path.abspath(f"outputs/{unique_filename}")  

        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(
            temp_output_path,
            fourcc,
            cap.get(cv2.CAP_PROP_FPS),
            (int(cap.get(3)), int(cap.get(4))),
        )

        bounding_box_annotator = sv.BoxAnnotator()
        label_annotator = sv.LabelAnnotator()

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            annotated_frame = frame.copy()

            results = model.infer(frame)[0]
            detections = sv.Detections.from_inference(results)

            detected_numbers = []  
            labels = []

            for x1, y1, x2, y2 in detections.xyxy:
                roi = frame[int(y1):int(y2), int(x1):int(x2)]

                gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
                gray_roi = cv2.GaussianBlur(gray_roi, (5, 5), 0)
                binary_roi = cv2.adaptiveThreshold(
                    gray_roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
                )

                custom_config = r'--oem 3 --psm 8 -c tessedit_char_whitelist=ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
                try:
                    text = pytesseract.image_to_string(binary_roi, config=custom_config).strip()
                except Exception as ocr_error:
                    logging.error(f"OCR Error: {ocr_error}")
                    text = "N/A"

                logging.info(f"Recognized text: {text}")

                if text and text != "N/A":
                    detected_numbers.append(text)
                    if is_valid_indian_plate(text):
                        valid_number_plates.add(text)

                labels.append(f"Plate: {text}" if text else "Plate: N/A")

            if len(labels) == len(detections.xyxy):
                annotated_frame = label_annotator.annotate(
                    scene=annotated_frame,
                    detections=detections,
                    labels=labels
                )
            else:
                annotated_frame = bounding_box_annotator.annotate(scene=annotated_frame, detections=detections)

            _, buffer = cv2.imencode('.jpg', annotated_frame)
            frame_bytes = buffer.tobytes()

            for client in connected_clients:
                await client.send_bytes(frame_bytes)  
                await client.send_json({"detected_numbers": detected_numbers, "valid_numbers": list(valid_number_plates)})

            out.write(annotated_frame)

        cap.release()
        out.release()
        cv2.destroyAllWindows()

        ffmpeg_cmd = [
            "ffmpeg", "-i", temp_output_path,
            "-c:v", "libx264", "-preset", "slow", "-crf", "23",
            final_output_path, "-y"
        ]
        result = subprocess.run(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        if result.returncode != 0:
            logging.error(f"FFmpeg Error: {result.stderr}")
            return JSONResponse({"error": "FFmpeg processing failed", "details": result.stderr}, status_code=500)

        os.remove(temp_output_path)

        return JSONResponse({
            "message": "Video processed and converted to H.264 successfully",
            "output_path": f"/outputs/{unique_filename}"
        })

    except Exception as e:
        logging.error(f"Error during video processing: {traceback.format_exc()}")
        return JSONResponse({"error": "Internal Server Error"}, status_code=500)
