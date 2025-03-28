"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, getDocs, where } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";

export default function TransactionHistory() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        console.log("Fetching transactions for user:", user.email);

        // Fetch user's vehicle numbers
        const userQuery = query(collection(db, "users"), where("email", "==", user.email));
        const userSnapshot = await getDocs(userQuery);

        if (userSnapshot.empty) {
          console.log("No user document found.");
          setLoading(false);
          return;
        }

        const userData = userSnapshot.docs[0].data();
        const userVehicles = userData.vehicleNumbers || [];

        if (userVehicles.length === 0) {
          console.log("User has no registered vehicles.");
          setLoading(false);
          return;
        }

        console.log("User's registered vehicle numbers:", userVehicles);

        // Query transactions directly by vehicle number
        const transactionsQuery = query(
          collection(db, "toll_transactions"),
          where("transactions.vehicleNumber", "in", userVehicles) // Firestore query fix
        );
        const transactionsSnapshot = await getDocs(transactionsQuery);

        let userTransactions = [];

        transactionsSnapshot.forEach((doc) => {
          const transactionData = doc.data();
          const sessionTransactions = transactionData.transactions || [];

          const filteredTransactions = sessionTransactions.filter((txn) =>
            userVehicles.includes(txn.vehicleNumber)
          );

          if (filteredTransactions.length > 0) {
            console.log("User transactions found:", filteredTransactions);
          }

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
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Transaction History</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading transactions...</p>
      ) : transactions.length === 0 ? (
        <p className="text-center text-red-500">No transactions found.</p>
      ) : (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Vehicle Number</th>
                <th className="p-3 text-left">Toll Fee</th>
                <th className="p-3 text-left">Balance Before</th>
                <th className="p-3 text-left">Balance After</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Time</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr key={index} className="border-b">
                  <td className="p-3">{txn.vehicleNumber}</td>
                  <td className="p-3 text-green-600 font-bold">₹{txn.tollFee}</td>
                  <td className="p-3">₹{txn.balanceBefore}</td>
                  <td className="p-3">₹{txn.balanceAfter}</td>
                  <td className={`p-3 font-bold ${txn.status === "Paid" ? "text-green-600" : "text-red-600"}`}>
                    {txn.status}
                  </td>
                  <td className="p-3">{new Date(txn.time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
