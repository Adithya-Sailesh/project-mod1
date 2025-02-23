"use client"; // Required for using client-side interactivity

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [uploading, setUploading] = useState(false); // Track upload status
  const [selectedFile, setSelectedFile] = useState(null); // Store the selected file
  const [outputVideoUrl, setOutputVideoUrl] = useState(""); // Store the output video URL
  const fileInputRef = useRef(null); // Reference to the file input
  const videoRef = useRef(null); // Reference to the video element

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
        const videoUrl = `http://127.0.0.1:5000${data.output_path}`;
        setOutputVideoUrl(videoUrl);
        console.log("Output video URL:", videoUrl); 
      }

      alert("Video uploaded and processed successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Failed to upload video. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  // Automatically play the video once it has loaded
  useEffect(() => {
    if (outputVideoUrl && videoRef.current) {
      const handleLoadedData = () => {
        videoRef.current.play();
      };

      videoRef.current.addEventListener("loadeddata", handleLoadedData);

      return () => {
        videoRef.current.removeEventListener("loadeddata", handleLoadedData);
      };
    }
  }, [outputVideoUrl]);

  // Trigger file input when the button is clicked
  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 style={{ fontSize: "40px" }}>Admin Panel</h1>
      <h1>Upload Video</h1>
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
          <video ref={videoRef} controls width="600" style={{ marginTop: "10px" }}>
            <source src={outputVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )
    }
    </div>
  );
}
