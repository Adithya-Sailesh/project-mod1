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
    <div className="w-fit h-fit flex-start mt-20 px-20 py-10 rounded-lg border-[0.5px] text-white">
      <div className="w-full"><h1 className="text-3xl">Register</h1></div>
      <p className="mr-auto text-sm">Already have an account? <button
        onClick={() => router.push("/login")}
        className="text-blue-500 hover:underline hover:underline-offset-2"
      >
        Sign In
      </button></p>

      {/* Registration Form */}
      <div className="flex-center mt-8 mb-10">
        <form onSubmit={handleRegister} className="flex-center w-fit">
          
            {/* Full Name Input */}
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-transparent mb-4 px-2 py-1 rounded-md bg-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            {/* Email Input */}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-transparent mb-4 px-2 py-1 rounded-md bg-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            {/* Password Input */}
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="bg-transparent mb-4 px-2 py-1 rounded-md bg-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            {/* Vehicle Details Input */}
            <input
              type="text"
              placeholder="Vehicle Details"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              required
              className="bg-transparent mb-4 px-2 py-1 rounded-md bg-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            {/* Vehicle Number Input */}
            <input
              type="text"
              placeholder="Vehicle Number"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
              className="bg-transparent mb-4 px-2 py-1 rounded-md bg-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />

            {/* Vehicle Image Upload */}
            <div className="w-full mt-1">
              
              <input
                type="file"
                accept="image/*"
                id="vehicleImage"
                onChange={handleImageChange}
                required
                className="hidden bg-transparent mb-4 px-2 py-1 rounded-md border-[0.5px] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <label htmlFor="vehicleImage" className="cursor-pointer px-2 py-2 rounded-md border-[0.5px] hover:border-blue-500 text-slate-400">Add Vehicle Image</label>
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
              className="bg-blue-500 text-white px-10 py-2 rounded-md hover:bg-blue-600 mt-8"
              disabled={loading}
            >
              {loading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              ) : (
                "Register"
              )}
            </button>
          
        </form>
      </div>
    </div>
  );
}
