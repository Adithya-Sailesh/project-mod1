"use client";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

export default function BlacklistedUsers() {
  const [blacklistedUsers, setBlacklistedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlacklistedUsers = async () => {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("blacklisted", "==", true));
      const querySnapshot = await getDocs(q);
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBlacklistedUsers(usersList);
      setLoading(false);
    };

    fetchBlacklistedUsers();
  }, []);

  const handleRemoveBlacklist = async (user) => {
    const confirmRemove = confirm(`Are you sure you want to remove ${user.name} from the blacklist?`);
    if (!confirmRemove) return;

    try {
      const res = await fetch("/api/toll/removeBlacklist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleNumber: user.vehicleNumber }),
      });

      const data = await res.json();
      alert(data.message);
      
      // Remove user from UI
      setBlacklistedUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
    } catch (error) {
      console.error("Error removing from blacklist:", error);
      alert("Failed to remove from blacklist.");
    }
  };

  return (
    <div className="flex flex-col items-center mt-20 px-10 py-10 rounded-lg border-[0.5px] text-white">
      <h1 className="text-3xl mb-6 text-red-500">Blacklisted Users</h1>

      {loading ? (
        <p className="text-gray-400 text-lg">Loading...</p>
      ) : blacklistedUsers.length === 0 ? (
        <h2 className="text-xl text-gray-300">No blacklisted users found.</h2>
      ) : (
        <div className="w-full max-w-4xl bg-gray-900 p-6 shadow-lg rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-red-600 text-white">
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Email</th>
                <th className="p-3 text-left">Vehicle Number</th>
                <th className="p-3 text-left">Balance (₹)</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {blacklistedUsers.map(user => (
                <tr key={user.id} className="border-b border-gray-700 text-gray-300">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3">{user.vehicleNumber}</td>
                  <td className="p-3 text-green-400 font-bold">₹{user.balance}</td>
                  <td className="p-3">
                    <button
                      className="bg-blue-500 text-white px-3 py-1 rounded-md hover:bg-blue-600 transition"
                      onClick={() => handleRemoveBlacklist(user)}
                    >
                      Remove from Blacklist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
