"use client"; // Required for using client-side interactivity

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation"; 
import { db } from "../../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
export default function Home() {
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [outputVideoUrl, setOutputVideoUrl] = useState("");
  const [processingComplete, setProcessingComplete] = useState(false);
  const [liveFrame, setLiveFrame] = useState(null);
  const [detectedNumbers, setDetectedNumbers] = useState([]);
  const [validNumbers, setValidNumbers] = useState([]); // Store valid number plates
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  
  const router = useRouter(); 

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      
    }
  };

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

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Backend returned an invalid response: ${text}`);
      }

      const data = await response.json();
      console.log(data);

      if (data.output_path) {
        const videoUrl = `http://127.0.0.1:5000${data.output_path}`;
        setOutputVideoUrl(videoUrl);
        setProcessingComplete(true);
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

  ///newcode space
  useEffect(() => {
    if (processingComplete && validNumbers.length > 0) {
      // Send valid number plates to Firebase
      const saveValidPlates = async () => {
        try {
          const validPlatesCollection = collection(db, "valid_plates");
          await addDoc(validPlatesCollection, {
            plates: validNumbers,
            timestamp: new Date(),
          });
          console.log("Valid number plates saved to Firebase");
        } catch (error) {
          console.error("Error saving valid plates:", error);
        }
      };
  
      saveValidPlates();
  
      // Show alert with valid plates
      alert(`Valid Number Plates Detected:\n\n${validNumbers.join("\n")}`);
    }
  }, [processingComplete]);


  useEffect(() => {
    if (outputVideoUrl && videoRef.current) {
      const handleLoadedData = () => {
        videoRef.current.play();
      };

      videoRef.current.addEventListener("loadeddata", handleLoadedData);

      return () => {
        if (videoRef.current) { // 
          videoRef.current.removeEventListener("loadeddata", handleLoadedData);
        }
      };
    }
  }, [outputVideoUrl]);
  
  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:5000/ws");

    socket.onmessage = (event) => {
      if (event.data instanceof Blob) {
        const reader = new FileReader();
        reader.onload = () => setLiveFrame(reader.result);
        reader.readAsDataURL(event.data);
      } else {
        try {
          const jsonData = JSON.parse(event.data);
          if (jsonData.detected_numbers) {
            setDetectedNumbers(jsonData.detected_numbers);
          }
          if (jsonData.valid_numbers) {
            
            setValidNumbers(jsonData.valid_numbers); // Update valid number plates
            
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      }
    };

    socket.onerror = (error) => console.error("WebSocket Error:", error);
    socket.onclose = () => console.log("WebSocket Closed");

    return () => socket.close();
  }, []);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  return (

    <div style={{ textAlign: "center", marginTop: "50px" }}>
      {/* Navbar
      <nav style={{ display: "flex", justifyContent: "center", gap: "20px", marginBottom: "20px" }}>
        <button 
          onClick={() => router.push("/admin/users")} 
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px" }}
        >
          View Registered Users
        </button>
        <button 
          onClick={() => router.push("/admin/blacklisted")} 
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#ff0000", color: "white", border: "none", borderRadius: "5px" }}
        >
          View Blacklisted Users
        </button>
        <button 
          onClick={() => router.push("/admin/panel")} 
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer", backgroundColor: "#781458", color: "white", border: "none", borderRadius: "5px" }}
        >
          Admin Panel
        </button>
      </nav> */}
      <h1 style={{ fontSize: "40px" }}>Admin Panel</h1>
      <h1>Upload Video</h1>
      <input
        type="file"
        accept="video/*"
        onChange={handleFileChange}
        ref={fileInputRef}
        style={{ display: "none" }}
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

      {/* Live Processing, Detected Number Plates, and Valid Plates */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "40px",
          marginTop: "30px",
        }}
      >
        {/* Live Processed Frame (Left) */}
        <div>
          <h2>Live Processing</h2>
          {liveFrame ? (
            <img
              src={liveFrame}
              alt="Live Processed Frame"
              style={{ width: "400px", height: "auto", border: "1px solid black" }}
            />
          ) : (
            <p>No live frames yet</p>
          )}
        </div>

        {/* Detected Number Plates (Center) */}
        <div>
          <h2>Detected Number Plates</h2>
          <ul style={{ textAlign: "left" }}>
            {detectedNumbers.length > 0 ? (
              detectedNumbers.map((plate, index) => (
                <li key={index} style={{ fontSize: "18px" }}>
                  
                  {plate}
                </li>
              ))
            ) : (
              <p>No number plates detected yet</p>
            )}
          </ul>
        </div>

        {/* Valid Number Plates (Right) */}
        <div>
          <h2 style={{ color: "green" }}>Valid Number Plates</h2>
          <ul style={{ textAlign: "left", fontSize: "18px", color: "green" }}>
            {validNumbers.length > 0 ? (
              validNumbers.map((plate, index) => (
                <li key={index} style={{ fontWeight: "bold" }}>
                  ✅ {plate} - Verified
                </li>
              ))
            ) : (
              <p>No valid plates detected yet</p>
            )}
          </ul>
        </div>
      </div>

      {/* Processed Video */}
      {outputVideoUrl && (
        <div style={{ marginTop: "20px" }}>
          <h2>Processed Video</h2>
          <video ref={videoRef} controls width="600" style={{ marginTop: "10px" }}>
            <source src={outputVideoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}

      {/* Collect Fee Button */}
      <div style={{ marginTop: "30px" }}>
      <button
    onClick={() => router.push("/admin/toll")}
    disabled={!processingComplete}
    style={{
      padding: "12px 24px",
      fontSize: "18px",
      cursor: processingComplete ? "pointer" : "not-allowed",
      backgroundColor: processingComplete ? "#ff6347" : "#cccccc",
      color: "white",
      border: "none",
      borderRadius: "5px",
      fontWeight: "bold",
      transition: "background-color 0.3s ease",
      minWidth: "200px",
      boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
      opacity: processingComplete ? 1 : 0.7
    }}
    aria-disabled={!processingComplete}
    title={!processingComplete ? "Complete processing to enable this button" : ""}
  >
    Collect Toll Fee
  </button>
      </div>


    </div>
  );
}