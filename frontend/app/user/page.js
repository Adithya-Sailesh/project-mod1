"use client";

import { useState, useEffect } from "react";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function UserProfile() {
  const [userData, setUserData] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        const docSnap = await getDoc(doc(db, "users", user.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    };

    fetchUserData();
  }, []);

  if (!userData) return <p>Loading...</p>;

  return (
    <div className="flex w-full h-screen">
      <div className="flex flex-col m-auto mt-32 border rounded-md p-5">
        <h1 className="text-4xl mb-10">Welcome, {userData.name}</h1>
        <p>Email: {userData.email}</p>
        <p>Vehicle: {userData.vehicle}</p>
        <button onClick={() => auth.signOut() && router.push("/login")} className="bg-blue-500 mt-10 py-2 rounded-md">Logout</button>
      </div>
    </div>
  );
}