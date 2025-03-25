"use client";
import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
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
    <div className="min-h-screen bg-gray-100 p-6 font-bold text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Registered Users</h1>

      <table className="w-full bg-white shadow-md rounded-lg">
        <thead>
          <tr className="bg-gray-300">
            <th className="p-2">Name</th>
            <th className="p-2">Email</th>
            <th className="p-2">Vehicle Number</th>
            <th className="p-2">Balance</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">{user.vehicleNumber}</td>
              <td className="p-2">{user.balance}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
