"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx"; // ✅ Import xlsx for Excel export

export default function TransactionDetailsPage() {
  const { id } = useParams();
  const [transaction, setTransaction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return; // 🚨 Prevent API call if id is missing

    async function fetchTransaction() {
      try {
        const res = await fetch(`/api/toll/transactions/${id}`);

        if (!res.ok) {
          throw new Error(`Failed to fetch transaction. Status: ${res.status}`);
        }

        const data = await res.json();
        setTransaction(data);
      } catch (err) {
        console.error("Error fetching transaction:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchTransaction();
  }, [id]);

  // ✅ Function to export transactions to Excel
  const exportToExcel = () => {
    if (!transaction || !transaction.transactions?.length) {
      alert("No transactions available to export.");
      return;
    }

    const worksheetData = transaction.transactions.map((tx) => ({
      "Transaction ID": transaction.id,
      "Vehicle Number": tx.vehicleNumber,
      Owner: tx.owner,
      "Toll Fee (₹)": tx.tollFee,
      "Balance Before (₹)": tx.balanceBefore ?? "N/A",
      "Balance After (₹)": tx.balanceAfter ?? "N/A",
      Status: tx.status,
      Time: new Date(tx.time.seconds * 1000).toLocaleString(),
    }));

    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    // Save file
    XLSX.writeFile(workbook, `Toll_Transactions_${transaction.id}.xlsx`);
  };

  if (loading) return <p className="text-center mt-10 text-gray-600">Loading transaction details...</p>;
  if (error) return <p className="text-center mt-10 text-red-500">Error: {error}</p>;
  if (!transaction) return <p className="text-center mt-10 text-red-500">Transaction not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Transaction Details</h1>

        <div className="border-b pb-4 mb-4">
          <p className="text-blue-600"><strong className="text-gray-600">Transaction ID:</strong> {transaction.id}</p>
          <p className="text-blue-600"><strong className="text-gray-600">Total Collected:</strong> ₹{transaction.totalCollected}</p>
          <p className="text-blue-600"><strong className="text-gray-600">Total Vehicles:</strong> {transaction.totalVehicles}</p>
        </div>

        {/* ✅ Export Button */}
        <button
          className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700"
          onClick={exportToExcel}
        >
          📂 Export to Excel
        </button>

        <h2 className="text-xl font-semibold mb-3 text-blue-500">Transactions</h2>
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
              <p className="text-blue-600"><strong className="text-gray-600">Balance Before:</strong> ₹{tx.balanceBefore ?? "N/A"}</p>
              <p className="text-blue-600"><strong className="text-gray-600">Balance After:</strong> ₹{tx.balanceAfter ?? "N/A"}</p>
              <p className="text-blue-600"><strong className="text-gray-600">Time:</strong> {new Date(tx.time.seconds * 1000).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
