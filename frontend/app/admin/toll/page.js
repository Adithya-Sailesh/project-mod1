"use client";

import { useEffect, useState } from "react";
import { db } from "../../firebaseConfig";
import { collection, query, orderBy, onSnapshot, VectorValue } from "firebase/firestore";

export default function TollCollection() {
  const [validPlates, setValidPlates] = useState([]);
  const [vehicleData, setVehicleData] = useState({}); // Store lookup results
  const [loading, setLoading] = useState(true);
  const [tollFee, setTollFee] = useState(50); // Flat toll fee

  useEffect(() => {
    // Fetch valid plates in real-time
    const validPlatesCollection = collection(db, "valid_plates");
    const q = query(validPlatesCollection, orderBy("timestamp", "desc"));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      if (!snapshot.empty) {
        const latestEntry = snapshot.docs[0].data();
        const plates = latestEntry.plates || [];

        setValidPlates(plates);
        fetchVehicleDetails(plates); // Fetch owner & balance
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch owner & balance from lookup API
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
    console.log("Updated vehicleData:", details); // Corrected console log
  };

  
  const processFee = async (vehicleNumber) => {
    try {
      // Ensure vehicleData is up-to-date
      const vehicle = vehicleData[vehicleNumber];
  
      console.log("Processing fee for:", vehicleNumber, "Vehicle Data:", vehicle); // Debugging
  
      if (!vehicle || vehicle.owner === "Not Registered") {
        alert("Vehicle not registered!");
        return;
      }
  
      if (vehicle.balance < tollFee) {
        // Blacklist after 3 failed attempts
        const blacklistRes = await fetch("/api/toll/blacklist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleNumber }),
        });
  
        const blacklistData = await blacklistRes.json();
        console.log("Blacklist Response:", blacklistData); // Debugging
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
      console.log("Deduction Response:", deductData); // Debugging
  
      // Check if API returned an error
      if (deductData.error) {
        alert(`Error: ${deductData.error}`);
        return;
      }
  
      alert(deductData.message || "Unknown response");
  
      // Refresh the balance after deduction
      await fetchVehicleDetails(validPlates); // Ensure state is updated after processing fee
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
