"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { loadStripe } from "@stripe/stripe-js";

export default function Recharge() {
  const router = useRouter();
  const [balance, setBalance] = useState(0);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY);

  useEffect(() => {
    const fetchBalance = async () => {
      const user = auth.currentUser;
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setBalance(userSnap.data().balance || 0);
        }
      }
    };
    fetchBalance();
  }, []);

  const handleRecharge = async () => {
    

    if (!amount || amount <= 0) {
      alert("Enter a valid amount");
      return;
    }

    setLoading(true);
    sessionStorage.setItem("rechargeAmount", amount); // Store amount before redirecting

    const stripe = await stripePromise;
    const user = auth.currentUser; // Get the logged-in user

    if (!user) {
      alert("User not logged in.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: amount * 100, // Convert ₹ to paise (₹50 → 5000)
          userId: user.uid, // Pass userId
        }),
      });

      if (!response.ok) throw new Error("Failed to create payment session.");

      const session = await response.json();
      if (!session.id) throw new Error("Invalid session ID from Stripe.");
      sessionStorage.setItem("transactionId", session.id);
      await stripe.redirectToCheckout({ sessionId: session.id });
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-gray-900 mb-6">Recharge Wallet</h1>

      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <p className="text-xl mb-4 text-gray-700">Current Balance: ₹{balance}</p>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-blue-500 w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        <button
          onClick={handleRecharge}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors"
          disabled={loading}
        >
          {loading ? "Processing..." : "Recharge"}
        </button>
      </div>
    </div>
  );
}
