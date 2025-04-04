"use client";

import { useEffect, useState, useRef } from "react";
import { db } from "../../../firebaseConfig";
import { collection, query, orderBy, onSnapshot, doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";
import toast from "react-hot-toast";

export default function TollCollection() {
  const [validPlates, setValidPlates] = useState([]);
  const [vehicleData, setVehicleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [tollFee, setTollFee] = useState(50);  //toll flat fee 50 rupee change here 
  const [sessionId, setSessionId] = useState(null);
  const sessionInitialized = useRef(false); // Ensures session is initialized only once

  // Initialize a new session only once
  const initializeSession = async () => {
    if (sessionInitialized.current) return;
    sessionInitialized.current = true;

    const newSessionId = Timestamp.now().toMillis().toString();

    try {
      const sessionRef = doc(db, "toll_transactions", newSessionId);
      await setDoc(sessionRef, {
        id: newSessionId,
        timestamp: Timestamp.now(),
        totalVehicles: 0,
        totalCollected: 0,
        transactions: [],
      });
      console.log("New session created with ID:", newSessionId);

      setSessionId(newSessionId);
    } catch (error) {
      console.error("Error initializing session:", error);
    }
  };

  useEffect(() => {
    initializeSession(); // Ensure this runs only once

    // Fetch valid plates in real-time
    const validPlatesCollection = collection(db, "valid_plates");
    const q = query(validPlatesCollection, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const latestEntry = snapshot.docs[0].data();
        const plates = latestEntry.plates || [];

        setValidPlates(plates);
        fetchVehicleDetails(plates);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch vehicle owner & balance details
  const fetchVehicleDetails = async (plates) => {
    let details = {};
    for (const plate of plates) {
      try {
        const res = await fetch(`/api/toll/lookup?number=${plate}`);
        const vehicle = await res.json();
        details[plate] = vehicle.exists
          ? { owner: vehicle.owner, balance: vehicle.balance }
          : { owner: "Not Registered", balance: 0 };
      } catch (error) {
        console.error(`Error fetching data for ${plate}:`, error);
        details[plate] = { owner: "Error", balance: 0 };
      }
    }
    setVehicleData(details);
  };

  // Process toll fee for a vehicle
  const processFee = async (vehicleNumber) => {
    if (!sessionId) {
      toast.error("Session ID not found! Try reloading the page.");
      return;
    }

    try {
      const res = await fetch("/api/toll/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleNumber, amount: tollFee }),
      });

      const result = await res.json();
      if (!res.ok) {
        toast.error(result.error || "Transaction failed!");
        return;
      }

      let message = "Toll processed successfully!";
      if (result.newBalance < 0) {
        message = `Insufficient balance! Double toll fee deducted, balance is now negative (-₹${Math.abs(result.newBalance)})`;
      }
      if (result.blacklisted) {
        message += " 🚨 User has been blacklisted due to repeated insufficient funds.";
      }

      toast.success(message);

      // ✅ Store transaction in Firestore
      const transactionData = {
        vehicleNumber,
        tollFee: result.deductedAmount,
        owner: vehicleData[vehicleNumber]?.owner || "Unknown",
        balanceBefore: vehicleData[vehicleNumber]?.balance || 0,
        balanceAfter: result.newBalance,
        status: result.blacklisted ? "Blacklisted" : "Paid",
        time: Timestamp.now(),
      };

      const sessionRef = doc(db, "toll_transactions", sessionId);
      await updateDoc(sessionRef, {
        totalVehicles: sessionId ? 1 : 0,
        totalCollected: sessionId ? result.deductedAmount : 0,
        transactions: arrayUnion(transactionData),
      });

      setVehicleData((prevData) => ({
        ...prevData,
        [vehicleNumber]: { ...prevData[vehicleNumber], balance: result.newBalance },
      }));

    } catch (error) {
      console.error("Error processing toll:", error);
      toast.error("An error occurred while processing the toll.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">Toll Collection</h1>

      {loading ? (
        <p className="text-center text-gray-600">Loading valid plates...</p>
      ) : validPlates.length === 0 ? (
        <p className="text-center text-red-500">No valid plates detected.</p>
      ) : (
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg" style={{ color: "black" }}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200">
                <th className="p-3 text-left">Vehicle Number</th>
                <th className="p-3 text-left">Owner</th>
                <th className="p-3 text-left">Balance</th>
                <th className="p-3 text-left">Action</th>
              </tr>
            </thead>
            <tbody>
              {validPlates.map((plate, index) => {
                const vehicle = vehicleData[plate] || { owner: "Loading...", balance: "..." };

                return (
                  <tr key={index} className="border-b">
                    <td className="p-3">{plate}</td>
                    <td className="p-3">{vehicle.owner}</td>
                    <td className={`p-3 font-bold ${vehicle.balance < 0 ? "text-red-600" : "text-green-600"}`}>
                      ₹{vehicle.balance}
                    </td>
                    <td className="p-3">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
                        onClick={() => processFee(plate)}
                        disabled={vehicle.owner === "Not Registered"}
                      >
                        Process Fee
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
