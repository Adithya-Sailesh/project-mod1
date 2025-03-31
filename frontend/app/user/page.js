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

  useEffect(() => {
    if (userData && userData.balance < 100) {
      alert("Your balance is low, please recharge.");
    }
  }, [userData]);

  const handleLogout = async () => {
    await auth.signOut();
    router.push("/login");
  };
  
  return (
    <div className="w-fit h-fit flex-start mt-20 px-20 py-10 rounded-lg border-[0.5px] text-white">
      <div className="w-full text-3xl">User Profile</div>
      {userData ? (
        <>
          <img
            src={userData.profileImage || "/default-avatar.png"}
            alt="Profile"
            className="w-32 h-32 mx-auto rounded-full shadow-md mb-4 border-4 border-blue-500"
          />
          <p className="text-lg font-semibold mb-2">{userData.name}</p>
          <p className="text-sm">{userData.email}</p>
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="font-semibold">Vehicle: <span className="text-blue-500">{userData.vehicle}</span></p>
            <p className="font-semibold">Number: <span className="text-red-500">{userData.vehicleNumber}</span></p>
            <p className="font-semibold">Balance: <span className="text-red-500">{userData.balance}</span></p>
            <p className="font-semibold">{userData.blacklisted ? "Blacklisted" : "Clear"}</p>
          </div>
          <button
            onClick={() => router.push("/recharge")}
            className="bg-green-500 text-white px-10 py-2 rounded-md hover:bg-green-600 mt-6"
          >
            Recharge Wallet
          </button>
          <button
            className="bg-blue-500 text-white px-10 py-2 rounded-md hover:bg-blue-600 mt-2"
            onClick={() => router.push("/user/transactions")}
          >
            View Transaction History
          </button>
          <button
            className="bg-blue-500 text-white px-10 py-2 rounded-md hover:bg-blue-600 mt-2"
            onClick={() => router.push("/user/recharge-history")}
          >
            View Recharge History
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white py-2 px-6 rounded-md mt-6"
          >
            Logout
          </button>
        </>
      ) : (
        <p className="text-gray-300">Loading user data...</p>
      )}
    </div>
  );
}