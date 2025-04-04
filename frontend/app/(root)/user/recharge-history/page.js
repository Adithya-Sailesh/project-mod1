"use client";
import { useState, useEffect } from "react";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
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
    const q = query(
      transactionsRef,
      where("userId", "==", user.uid),
      orderBy("timestamp", "desc") // Order by timestamp in descending order
    );
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
    <div className="flex-center w-full h-screen mb-20">
    <div className="w-fit h-fit flex flex-col items-center mt-20 px-20 py-10 rounded-lg border-[0.5px] text-white">
      <h1 className="text-3xl mb-6">Recharge History</h1>

      {transactions.length > 0 ? (
        <div className="w-full max-w-2xl bg-gray-800 p-6 shadow-lg rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-blue-600 text-white">
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Amount (₹)</th>
                <th className="p-3 text-left">Before (₹)</th>
                <th className="p-3 text-left">After (₹)</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b text-gray-300">
                  <td className="p-3">{tx.timestamp.toLocaleDateString("en-GB")} {tx.timestamp.toLocaleTimeString()}</td>
                  <td className="p-3 text-green-400 font-bold">₹{tx.amount}</td>
                  <td className="p-3 text-gray-400">₹{tx.balanceBefore}</td>
                  <td className="p-3 text-white font-semibold">₹{tx.balanceAfter}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-lg text-white ${tx.status === "Success" ? "bg-green-500" : "bg-red-500"}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400 text-lg">No recharge history found.</p>
      )}
    </div>
    </div>
  );
}
