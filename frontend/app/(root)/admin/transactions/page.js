"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchTransactions() {
      try {
        const res = await fetch("/api/toll/transactions");
        if (!res.ok) throw new Error("Failed to fetch transactions.");
        
        const data = await res.json();
        setTransactions(data);
      } catch (error) {
        console.error("Error fetching transactions:", error);
        setError("Failed to load transactions.");
      }
    }
    fetchTransactions();
  }, []);

  function formatDate(timestamp) {
    if (!timestamp?.seconds) return "Invalid Date";

    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-6 mb-60">
      <div className="w-fit h-fit flex flex-col px-10 py-10 rounded-lg border-[0.5px] text-white">
        <h1 className="text-3xl mb-6">Transaction History</h1>

        {error ? (
          <p className="text-red-500 font-semibold">{error}</p>
        ) : transactions.length === 0 ? (
          <p className="text-gray-400">No transactions found.</p>
        ) : (
          <ul className="divide-y divide-gray-600">
            {transactions.map((transaction) => (
              <li key={transaction.id} className="p-3 hover:bg-gray-800 transition rounded-lg">
                <Link href={`/admin/transaction/${transaction.id}`} className="text-blue-400 font-medium hover:underline">
                  {formatDate(transaction.timestamp)}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
  