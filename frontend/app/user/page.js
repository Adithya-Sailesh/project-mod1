"use client";
import { useEffect, useState } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserData(userDoc.data());
        }
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">User Profile</h1>
        
        {userData ? (
          <>
            <img
              src={userData.profileImage || "/default-avatar.png"} // Default if no image
              alt="Profile"
              className="w-32 h-32 mx-auto rounded-full shadow-md mb-4 border-4 border-blue-500"
            />
            <p className="text-lg text-gray-700 font-semibold mb-2">{userData.name}</p>
            <p className="text-gray-600">{userData.email}</p>
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <p className="font-semibold text-gray-700">Vehicle: <span className="text-blue-500">{userData.vehicle}</span></p>
              <p className="font-semibold text-gray-700">Number: <span className="text-red-500">{userData.vehicleNumber}</span></p>
              <p className="font-semibold text-gray-700">Balance: <span className="text-red-500">{userData.balance}</span></p>
            </div>
            <button
              onClick={() => router.push("/recharge")}
              className="mt-4 bg-green-600 text-white p-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Recharge Wallet
            </button>

            <button
              onClick={handleLogout}
              className="mt-6 bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-lg shadow-lg transition duration-300"
            >
              Logout
            </button>
          </>
        ) : (
          <p className="text-gray-600">Loading user data...</p>
        )}
      </div>
    </div>
  );
}
