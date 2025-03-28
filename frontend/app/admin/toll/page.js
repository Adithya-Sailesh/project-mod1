"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, orderBy, onSnapshot, doc, setDoc, getDoc, updateDoc, arrayUnion, Timestamp } from "firebase/firestore";

export default function TollCollection() {
  const [validPlates, setValidPlates] = useState([]);
  const [vehicleData, setVehicleData] = useState({});
  const [loading, setLoading] = useState(true);
  const [tollFee, setTollFee] = useState(50);
  const [sessionId, setSessionId] = useState(null);

  // Initialize a new session when a new video is processed
  const initializeSession = async () => {
    const newSessionId = Timestamp.now().toMillis().toString(); // Use server timestamp as session ID

    try {
      const sessionRef = doc(db, "toll_transactions", newSessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (!sessionSnap.exists()) {
        await setDoc(sessionRef, {
          id: newSessionId,
          timestamp: Timestamp.now(),
          totalVehicles: 0,
          totalCollected: 0,
          transactions: []
        });
        console.log("New session created with ID:", newSessionId);
      } else {
        console.log("Existing session found:", newSessionId);
      }

      setSessionId(newSessionId);
    } catch (error) {
      console.error("Error initializing session:", error);
    }
  };

  useEffect(() => {
    initializeSession();

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
      alert("Session ID not found! Try reloading the page.");
      return;
    }

    try {
      const vehicle = vehicleData[vehicleNumber];

      if (!vehicle || vehicle.owner === "Not Registered") {
        alert("Vehicle not registered!");
        return;
      }

      if (vehicle.balance < tollFee) {
        const blacklistRes = await fetch("/api/toll/blacklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleNumber }),
        });

        const blacklistData = await blacklistRes.json();
        alert(blacklistData.message);
        return;
      }

      // Deduct toll fee
      const deductRes = await fetch("/api/toll/deduct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleNumber, amount: tollFee }),
      });

      const deductData = await deductRes.json();
      if (deductData.error) {
        alert(`Error: ${deductData.error}`);
        return;
      }

      alert(deductData.message || "Unknown response");

      // Update session transaction log
      const sessionRef = doc(db, "toll_transactions", sessionId);
      const sessionSnap = await getDoc(sessionRef);

      if (sessionSnap.exists()) {
        const sessionData = sessionSnap.data();
        await updateDoc(sessionRef, {
          totalVehicles: sessionData.totalVehicles + 1,
          totalCollected: sessionData.totalCollected + tollFee,
          transactions: arrayUnion({
            vehicleNumber,
            owner: vehicle.owner,
            tollFee,
            balanceBefore: vehicle.balance,
            balanceAfter: vehicle.balance - tollFee,
            status: "Paid",
            time: Timestamp.now(),
          }),
        });
      }

      await fetchVehicleDetails(validPlates); // Refresh balance
    } catch (error) {
      console.error("Error processing toll:", error);
      alert("An error occurred while processing the toll.");
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
                    <td className="p-3 text-green-600 font-bold">₹{vehicle.balance}</td>
                    <td className="p-3">
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        onClick={() => processFee(plate)}
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
