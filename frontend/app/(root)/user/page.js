"use client";
import { useEffect, useState } from "react";
import { auth, db } from "@/app/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Profile() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login"); // Redirect to login if not authenticated
        return;
      }

      // Fetch user data
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup subscription
  }, [router]);

  useEffect(() => {
    if (userData && userData.balance < 100) {
      toast.error("Your balance is low, please recharge.");
    }
  }, [userData]);

  const handleLogout = async () => {
    console.log("Logging out...");
    await auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return <p className="text-white text-center mt-20">Loading...</p>;
  }

  return (
    <div className="w-full h-full flex-center mb-40">
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
              <p className="font-semibold">
                Vehicle: <span className="text-blue-500">{userData.vehicle}</span>
              </p>
              <p className="font-semibold">
                Number: <span className="text-red-500">{userData.vehicleNumber}</span>
              </p>
              <p className="font-semibold">
                Balance: <span className="text-red-500">{userData.balance}</span>
              </p>
              <p className="font-semibold">
                {userData.blacklisted ? "Blacklisted" : "Clear"}
              </p>
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
    </div>
  );
}
