"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import * as XLSX from "xlsx"; // ✅ Import xlsx for Excel export
import toast from "react-hot-toast";

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
      toast.error("No transactions available to export.");
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
    <div className="flex items-center justify-center min-h-screen px-6">
      <div className="w-fit h-fit flex flex-col px-10 py-10 rounded-lg border-[0.5px] text-white">
        <h1 className="text-3xl mb-6">Transaction Details</h1>

        <div className="border-b pb-4 mb-4">
          <p className="text-gray-400"><strong className="text-white">Transaction ID:</strong> {transaction.id}</p>
          <p className="text-gray-400"><strong className="text-white">Total Collected:</strong> ₹{transaction.totalCollected}</p>
          <p className="text-gray-400"><strong className="text-white">Total Vehicles:</strong> {transaction.totalVehicles}</p>
        </div>

        {/* ✅ Export Button */}
        <button
          className="bg-green-600 text-white px-4 py-2 rounded mb-4 hover:bg-green-700"
          onClick={exportToExcel}
        >
          📂 Export to Excel
        </button>

        <h2 className="text-xl font-semibold mb-3 text-gray-400">Transactions</h2>
        <ul className="border rounded-lg p-4 bg-gray-800">
          {transaction.transactions?.map((tx, index) => (
            <li key={index} className="p-3 border-b last:border-0">
              <p className="text-gray-400"><strong className="text-white">Owner:</strong> {tx.owner}</p>
              <p className="text-gray-400"><strong className="text-white">Vehicle:</strong> {tx.vehicleNumber}</p>
              <p className="text-gray-400"><strong className="text-white">Status:</strong> 
                <span className={`ml-2 px-2 py-1 text-sm font-medium rounded-full ${
                  tx.status === "Paid" ? "bg-green-200 text-green-800" : "bg-red-200 text-red-800"
                }`}>
                  {tx.status}
                </span>
              </p>
              <p className="text-gray-400"><strong className="text-white">Toll Fee:</strong> ₹{tx.tollFee}</p>
              <p className="text-gray-400"><strong className="text-white">Balance Before:</strong> ₹{tx.balanceBefore ?? "N/A"}</p>
              <p className="text-gray-400"><strong className="text-white">Balance After:</strong> ₹{tx.balanceAfter ?? "N/A"}</p>
              <p className="text-gray-400"><strong className="text-white">Time:</strong> {new Date(tx.time.seconds * 1000).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
