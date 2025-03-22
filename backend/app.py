from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import cv2
import os
import subprocess
import traceback
from inference import get_model
import supervision as sv
import pytesseract  # Tesseract OCR wrapper
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Serve processed videos
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# Load Roboflow API Key (Move to environment variable for security)
API_KEY = os.getenv("ROBOFLOW_API_KEY", "ru9Ag6REQG3256Iqf4Km")
model = get_model(model_id="number_plate-4v9tn/1", api_key=API_KEY)  # Load Roboflow model

@app.post("/process-video")
async def process_video(file: UploadFile = File(...)):
    try:
        # Validate video format
        if not file.filename.lower().endswith(('.mp4', '.avi', '.mov')):
            return JSONResponse({"error": "Invalid video format. Only .mp4, .avi, .mov are supported."}, status_code=400)

        # Ensure directories exist
        os.makedirs("uploads", exist_ok=True)
        os.makedirs("outputs", exist_ok=True)

        # Generate a unique filename for the uploaded video
        unique_filename = f"{uuid.uuid4()}_{file.filename}"
        video_path = os.path.abspath(f"uploads/{unique_filename}")

        # Save uploaded video
        with open(video_path, "wb") as buffer:
            buffer.write(await file.read())

        # Open video
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return JSONResponse({"error": "Failed to open video file."}, status_code=500)

        # Define output paths
        temp_output_path = os.path.abspath(f"outputs/temp_{unique_filename}")  # Temporary processed video
        final_output_path = os.path.abspath(f"outputs/{unique_filename}")  # H.264 converted video

        # Initialize VideoWriter
        fourcc = cv2.VideoWriter_fourcc(*"mp4v")
        out = cv2.VideoWriter(
            temp_output_path,
            fourcc,
            cap.get(cv2.CAP_PROP_FPS),
            (int(cap.get(3)), int(cap.get(4))),
        )

        # Create annotators
        bounding_box_annotator = sv.BoxAnnotator()
        label_annotator = sv.LabelAnnotator()

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break

            # Initialize annotated_frame with the original frame
            annotated_frame = frame.copy()

            # Run inference on the frame
            results = model.infer(frame)[0]

            # Process results into detections
            detections = sv.Detections.from_inference(results)

            # Ensure detections are present before annotation
            if len(detections.xyxy) > 0:
                labels = []  # List to store labels

                # Loop through each detection
                for x1, y1, x2, y2 in detections.xyxy:
                    # Extract the region of interest (ROI) for the number plate
                    roi = frame[int(y1):int(y2), int(x1):int(x2)]

                    # Preprocess the ROI for better OCR accuracy
                    gray_roi = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
                    gray_roi = cv2.GaussianBlur(gray_roi, (5, 5), 0)  # Reduce noise
                    binary_roi = cv2.adaptiveThreshold(
                        gray_roi, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY, 11, 2
                    )

                    # Use Tesseract OCR to recognize text from the ROI
                    custom_config = r'--oem 3 --psm 6'
                    try:
                        text = pytesseract.image_to_string(binary_roi, config=custom_config).strip()
                    except Exception as ocr_error:
                        logging.error(f"OCR Error: {ocr_error}")
                        text = "N/A"  # Default label if OCR fails

                    # Log recognized text
                    logging.info(f"Recognized text: {text}")
                    labels.append(f"Plate: {text}" if text else "Plate: N/A")

                # Annotate the frame with labels
                annotated_frame = label_annotator.annotate(
                    scene=annotated_frame,
                    detections=detections,
                    labels=labels
                )
            else:
                annotated_frame = bounding_box_annotator.annotate(scene=annotated_frame, detections=detections)

            # Display the annotated frame in real-time
            cv2.imshow('Number Plate Detection', annotated_frame)
            cv2.waitKey(1)  # Wait for 1ms to refresh the display

            # Save frame to video
            out.write(annotated_frame)

        # Release resources
        cap.release()
        out.release()
        cv2.destroyAllWindows()

        # Convert to H.264 using FFmpeg
        ffmpeg_cmd = [
            "ffmpeg", "-i", temp_output_path,
            "-c:v", "libx264", "-preset", "slow", "-crf", "23",
            final_output_path, "-y"
        ]
        result = subprocess.run(ffmpeg_cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)

        # Check if FFmpeg executed successfully
        if result.returncode != 0:
            logging.error(f"FFmpeg Error: {result.stderr}")
            return JSONResponse({"error": "FFmpeg processing failed", "details": result.stderr}, status_code=500)

        # Delete temporary file
        os.remove(temp_output_path)

        return JSONResponse({
            "message": "Video processed and converted to H.264 successfully",
            "output_path": f"/outputs/{unique_filename}"
        })

    except Exception as e:
        logging.error(f"Error during video processing: {traceback.format_exc()}")
        return JSONResponse({"error": "Internal Server Error"}, status_code=500)
