"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig"; // Firebase authentication & Firestore

export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store user details in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        vehicle,
      });
      alert("User Created");
      console.log("User registered:", user);
      router.push("/login"); // Redirect to login after registration
    } catch (err) {
        console.log(err)
      setError("Failed to create account. Try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>Register</h1>
      <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "10px", width: "250px", color: "black" }}
        />
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
        <input
          type="text"
          placeholder="Vehicle Details (e.g., Red Honda Civic, KL-07-XXXX)"
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          required
          style={{ padding: "10px", marginBottom: "10px", width: "250px", color: "black" }}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button
          type="submit"
          style={{ padding: "10px 20px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Register
        </button>
      </form>
      
      {/* Login Button */}
      <p>Already have an account?</p>
      <button
        onClick={() => router.push("/login")}
        style={{ padding: "10px 20px", marginTop: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
      >
        Login
      </button>
    </div>
  );
}