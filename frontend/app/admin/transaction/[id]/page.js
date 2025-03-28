"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function TransactionDetailsPage() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);

  useEffect(() => {
    async function fetchTransaction() {
      try {
        const res = await fetch(`/api/toll/transactions/${id}`);
        const data = await res.json();
        setTransaction(data);
      } catch (error) {
        console.error("Error fetching transaction:", error);
      }
    }
    fetchTransaction();
  }, [id]);

  if (!transaction) return <p className="text-center mt-10 text-gray-600">Loading transaction details...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Transaction Details</h1>

        <div className="border-b pb-4 mb-4">
          <p className="text-blue-600"><strong className="text-gray-600">Transaction ID:</strong> {transaction.id}</p>
          <p className="text-blue-600"><strong className="text-gray-600">Total Collected:</strong> ₹{transaction.totalCollected}</p>
          <p className="text-blue-600"><strong className="text-gray-600">Total Vehicles:</strong> {transaction.totalVehicles}</p>
        </div>

        <h2 className="text-xl font-semibold mb-3">Transactions</h2>
        <ul className="border rounded-lg p-4 bg-gray-50">
          {transaction.transactions?.map((tx, index) => (
            <li key={index} className="p-3 border-b last:border-0">
              <p className="text-blue-600"><strong className="text-gray-600">Owner:</strong> {tx.owner}</p>
              <p className="text-blue-600"><strong className="text-gray-600">Vehicle:</strong> {tx.vehicleNumber}</p>
              <p className="text-blue-600"><strong className="text-gray-600">Status:</strong> 
                <span className={`ml-2 px-2 py-1 text-sm font-medium rounded-full ${
                  tx.status === "Paid" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                }`}>
                  {tx.status}
                </span>
              </p>
              <p className="text-blue-600"><strong className="text-gray-600">Toll Fee:</strong> ₹{tx.tollFee}</p>
              <p className="text-blue-600"><strong className="text-gray-600">Balance Before:</strong> ₹{tx.balanceBefore}</p>
              <p className="text-blue-600"><strong className="text-gray-600">Balance After:</strong> ₹{tx.balanceAfter}</p>
              <p className="text-blue-600"><strong className="text-gray-600">Time:</strong> {new Date(tx.time.seconds * 1000).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
