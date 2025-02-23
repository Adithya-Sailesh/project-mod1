"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfig"; // Firebase authentication instance

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // Hardcoded Admin Credentials
  const ADMIN_EMAIL = "admin@example.com";
  const ADMIN_PASSWORD = "admin123";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    // Check for Admin Login
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      alert("Welcome Admin")
      router.push("/admin");
      return;
    }

    // User Login with Firebase
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);
      router.push("/user"); // Redirect to user profile page
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1 style={{fontSize:'50px'}}>Auto-iD</h1>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", alignItems: "center",colour:"black" }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "10px", width: "250px", color: "black" }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "10px", width: "250px", color: "black" }}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" style={{ padding: "10px 20px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
          Login
        </button>
      </form>
      
      {/* Register Button */}
      <p>Don't have an account?</p>
      <button
        onClick={() => router.push("/register")}
        style={{ padding: "10px 20px", marginTop: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        Register
      </button>
    </div>
  );
}