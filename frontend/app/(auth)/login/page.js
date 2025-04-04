"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebaseConfig"; // Firebase authentication instance
import toast from "react-hot-toast";

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
      toast.success("Welcome Admin")
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
    <div className="flex-center w-full">
    <div className="w-fit h-fit flex-start mt-20 px-20 py-10 rounded-lg border-[0.5px] text-white">
      <div className="w-full"><h1 className="text-3xl">Sign In</h1></div>
      {/* Register Button */}
      <p className="mr-auto text-sm">Don't have an account? <button
        onClick={() => router.push("/register")}
        className="text-blue-500 hover:underline hover:underline-offset-2"
      >
        Register
      </button></p>
      <div className="flex-center mt-8 mb-10"><form onSubmit={handleLogin} className="flex-center">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-transparent mb-4 px-2 py-1 rounded-md bg-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="bg-transparent px-2 py-1 rounded-md bg-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
        <button type="submit" className="bg-blue-500 text-white px-10 py-2 rounded-md hover:bg-blue-600 mt-6" >
          Login
        </button>
      </form></div>      
    </div>
    </div>
  );
}