"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "@/app/firebaseConfig";

export default function RechargeHistory() {
  const [transactions, setTransactions] = useState([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      fetchTransactions();
    }
  }, [user]);

  const fetchTransactions = async () => {
    if (!user) return;

    const transactionsRef = collection(db, "recharge_transactions");
    const q = query(transactionsRef, where("userId", "==", user.uid));
    const querySnapshot = await getDocs(q);

    const history = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        amount: data.amount,
        balanceBefore: data.balanceBefore,
        balanceAfter: data.balanceAfter,
        timestamp: data.timestamp.toDate(), // Convert Firestore timestamp
        status: data.status,
      };
    });

    setTransactions(history);
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-600">Recharge History</h1>

      {transactions.length > 0 ? (
        <div className="w-full max-w-2xl bg-white p-6 shadow-lg rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-500 text-white">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Amount (₹)</th>
                <th className="p-3 text-left">Before (₹)</th>
                <th className="p-3 text-left">After (₹)</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b text-blue-500">
                  <td className="p-3">
                    {tx.timestamp.toLocaleDateString("en-GB")}{" "}
                    {tx.timestamp.toLocaleTimeString()}
                  </td>
                  <td className="p-3 text-green-600 font-bold">₹{tx.amount}</td>
                  <td className="p-3 text-gray-600">₹{tx.balanceBefore}</td>
                  <td className="p-3 text-gray-800 font-semibold">₹{tx.balanceAfter}</td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-1 rounded-lg text-white ${
                        tx.status === "Success" ? "bg-green-500" : "bg-red-500"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-600 text-lg">No recharge history found.</p>
      )}
    </div>
  );
}
