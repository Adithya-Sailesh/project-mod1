"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, getDocs, where } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";

export default function TransactionHistory() {
  const { user } = useAuth(); // Get logged-in user from AuthContext
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        console.log("Fetching transactions for user:", user.email);

        // Fetch user's vehicle numbers from Firestore
        const userQuery = query(collection(db, "users"), where("email", "==", user.email));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          console.log("No user document found.");
          setLoading(false);
          return;
        }

        const userData = userSnapshot.docs[0].data();
        const userVehicles = userData.vehicleNumber ? [userData.vehicleNumber] : [];

        if (userVehicles.length === 0) {
          console.log("User has no registered vehicles.");
          setLoading(false);
          return;
        }

        console.log("User's registered vehicle numbers:", userVehicles);

        // Fetch transactions from toll_transactions collection
        const transactionsQuery = query(collection(db, "toll_transactions"));
        const transactionsSnapshot = await getDocs(transactionsQuery);

        let userTransactions = [];

        transactionsSnapshot.forEach((doc) => {
          const sessionData = doc.data();
          const sessionTransactions = sessionData.transactions || [];

          // Filter transactions for user's vehicles
          const filteredTransactions = sessionTransactions.filter((txn) =>
            userVehicles.includes(txn.vehicleNumber)
          );

          userTransactions = [...userTransactions, ...filteredTransactions];
        });

        setTransactions(userTransactions);
      } catch (error) {
        console.error("Error fetching transactions:", error);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Toll Transaction History</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p className="text-center text-red-500">No transactions found.</p>
      ) : (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left text-gray-800">Vehicle Number</th>
                <th className="p-3 text-left text-gray-800">Toll Fee</th>
                <th className="p-3 text-left text-gray-800">Balance Before</th>
                <th className="p-3 text-left text-gray-800">Balance After</th>
                <th className="p-3 text-left text-gray-800">Status</th>
                <th className="p-3 text-left text-gray-800">Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3 text-blue-500">{txn.vehicleNumber}</td>
                  <td className="p-3 text-green-600 font-bold">₹{txn.tollFee}</td>
                  <td className="p-3 text-gray-600">₹{txn.balanceBefore}</td>
                  <td className="p-3 text-gray-600">₹{txn.balanceAfter}</td>
                  <td className={`p-3 font-bold ${txn.status === "Paid" ? "text-green-600" : "text-red-600"}`}>
                    {txn.status}
                  </td>
                  <td className="p-3 text-gray-500">
                  {txn.time?.toDate ? txn.time.toDate().toLocaleString() : "N/A"}
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
