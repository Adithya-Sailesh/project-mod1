"use client";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function BlacklistedUsers() {
  const [blacklistedUsers, setBlacklistedUsers] = useState([]);

  useEffect(() => {
    const fetchBlacklistedUsers = async () => {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("blacklisted", "==", true));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBlacklistedUsers(usersList);
    };

    fetchBlacklistedUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6 text-gray-700">
      <h1 className="text-2xl font-bold mb-4">Blacklisted Users</h1>

      <table className="w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-red-300">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Vehicle Number</th>
            <th className="p-2">Balance</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        {blacklistedUsers.length === 0 && <h1 className="font-bold text-red-500 justify-center">No Blacklisted Users</h1>}
        <tbody>
          {blacklistedUsers.map(user => (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.vehicleNumber}</td>
              <td className="p-2">{user.balance}</td>
              <td className="p-2">
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600"
                  onClick={async () => {
                    const res = await fetch("/api/toll/removeBlacklist", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ vehicleNumber: user.vehicleNumber }),
                    });

                    const data = await res.json();
                    alert(data.message);
                    setBlacklistedUsers(blacklistedUsers.filter(u => u.id !== user.id));
                  }}
                >
                  Remove from Blacklist
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
