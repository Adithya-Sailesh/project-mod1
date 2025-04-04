"use client";
import { useEffect, useState } from "react";
import { db } from "../../../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

export default function RegisteredUsers() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const querySnapshot = await getDocs(usersRef);
      const usersList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersList);
    };

    fetchUsers();
  }, []);

  return (
    <div className="flex flex-col items-center mt-20 px-10 py-10 rounded-lg border-[0.5px] text-white">
      <h1 className="text-3xl mb-6">Registered Users</h1>

      <div className="w-full max-w-4xl bg-gray-800 p-6 shadow-lg rounded-lg">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-blue-600 text-white">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Vehicle Number</th>
              <th className="p-3 text-left">Balance (₹)</th>
              <th className="p-3 text-left">Blacklisted</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} className="border-b text-gray-300">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">{user.vehicleNumber}</td>
                <td className="p-3 text-green-400 font-bold">₹{user.balance}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-lg text-white ${
                      user.blacklisted ? "bg-red-500" : "bg-green-500"
                    }`}
                  >
                    {user.blacklisted ? "Yes" : "No"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
