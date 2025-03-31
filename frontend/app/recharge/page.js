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
    <div className="w-fit h-fit flex flex-col items-center justify-center mt-20 px-20 py-10 rounded-lg border-[0.5px] text-white">
      <h1 className="text-3xl mb-4">Recharge Wallet</h1>

      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <p className="text-xl mb-4 text-gray-300">Current Balance: <span className="text-green-400">₹{balance}</span></p>

        <input
          type="number"
          placeholder="Enter amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-white bg-gray-700 w-full p-3 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        <button
          onClick={handleRecharge}
          className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Processing..." : "Recharge"}
        </button>
      </div>
    </div>
  );
}
