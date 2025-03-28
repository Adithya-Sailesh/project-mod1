"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword ,updateProfile} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db } from "../firebaseConfig"; // Firebase authentication & Firestore
export default function Register() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [vehicle, setVehicle] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleImage, setVehicleImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null); // State for preview
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Loading state
  const storage = getStorage(); // Initialize Firebase Storage

  // Function to handle image selection and preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVehicleImage(file);
      setPreviewImage(URL.createObjectURL(file)); // Create a temporary URL for preview
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Start loading

    try {
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let imageUrl = "";
      if (vehicleImage) {
        // Upload image to Firebase Storage
        const imageRef = ref(storage, `vehicleImages/${user.uid}`);
        await uploadBytes(imageRef, vehicleImage);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Store user details in Firestore
      await updateProfile(user, { displayName: name });
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        vehicle,
        vehicleNumber,
        profileImage: imageUrl, // Store image URL as profile icon
        balance: 0,
        blacklisted: false,
        blacklistCount:0,
      });

      alert("User Created");
      console.log("User registered:", user);
      router.push("/login"); // Redirect to login after registration
    } catch (err) {
      console.log(err);
      setError("Failed to create account. Try again.");
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      {/* Stylish "Register" Heading */}
      <h1 className="text-6xl font-bold text-gray-900 mb-8 animate-bounce">
        Register
      </h1>

      {/* Registration Form */}
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md" style={{ color: "black" }}>
        <div className="space-y-6">
          {/* Full Name Input */}
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Email Input */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Password Input */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Vehicle Details Input */}
          <input
            type="text"
            placeholder="Vehicle Details (e.g., Red Honda Civic)"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Vehicle Number Input */}
          <input
            type="text"
            placeholder="Vehicle Number (e.g., KL-07-XXXX)"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          {/* Vehicle Image Upload */}
          <div className="space-y-2">
            <label className="block text-gray-700 font-medium">Add Vehicle Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* Image Preview */}
            {previewImage && (
              <div className="mt-4">
                <p className="text-gray-600">Preview:</p>
                <img
                  src={previewImage}
                  alt="Vehicle Preview"
                  className="w-32 h-32 object-cover rounded-lg shadow-md border border-gray-300"
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          {/* Register Button with Loading Spinner */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            disabled={loading}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
            ) : (
              "Register"
            )}
          </button>
        </div>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <p className="text-gray-600">Already have an account?</p>
        <button
          onClick={() => router.push("/login")}
          className="mt-2 bg-green-600 text-white p-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          Login
        </button>
      </div>
    </div>
  );
}
