// frontend/app/page.js
"use client"; // Required for using client-side interactivity

import { useState, useRef } from "react";

export default function Home() {
  const [uploading, setUploading] = useState(false); // Track upload status
  const [selectedFile, setSelectedFile] = useState(null); // Store the selected file
  const [outputVideoUrl, setOutputVideoUrl] = useState(null); // Store the output video URL
  const fileInputRef = useRef(null); // Reference to the file input

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a video file first!");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      // Check if the response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Backend returned an invalid response: ${text}`);
      }

      const data = await response.json();
      console.log(data);

      // Set the output video URL
      if (data.output_path) {
        setOutputVideoUrl(`http://127.0.0.1:5000/${data.output_path}`);
      }

      alert("Video uploaded and processed successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Trigger file input when the button is clicked
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Vehicle Identification using YOLOv8</h1>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }} // Hide the default file input
      />
      <button
        onClick={handleButtonClick}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "5px",
          marginRight: "10px",
        }}
      >
        Select Video
      </button>
      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        style={{
          padding: "10px 20px",
          fontSize: "16px",
          cursor: selectedFile && !uploading ? "pointer" : "not-allowed",
          backgroundColor: selectedFile && !uploading ? "#0070f3" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        {uploading ? "Uploading..." : "Upload Video"}
      </button>
      {selectedFile && (
        <p style={{ marginTop: "20px" }}>Selected file: {selectedFile.name}</p>
      )}
      {outputVideoUrl && (
        <div style={{ marginTop: "20px" }}>
          <h2>Processed Video</h2>
          <video controls width="600" style={{ marginTop: "10px" }}>
            <source src={outputVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        
      )
      
      }
    </div>
  );
}