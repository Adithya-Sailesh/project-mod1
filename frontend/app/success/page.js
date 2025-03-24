"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function Success() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateBalance = async () => {
      try {
        // Wait for Firebase auth to initialize
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
            console.log("User authenticated:", user.uid);

            // Get user balance from Firestore
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const currentBalance = userSnap.data().balance || 0;
              const rechargeAmount = Number(sessionStorage.getItem("rechargeAmount") || 0);

              // Update balance only if recharge amount is valid
              if (rechargeAmount > 0) {
                await updateDoc(userRef, { balance: currentBalance + rechargeAmount });
                sessionStorage.removeItem("rechargeAmount"); // Clear stored amount
                console.log("Balance updated successfully");
              }
            }

            // Redirect to user dashboard
            router.push("/user");
          } else {
            console.error("User not authenticated.");
          }

          setLoading(false); // Stop loading
          unsubscribe(); // Cleanup listener
        });
      } catch (error) {
        console.error("Error updating balance:", error);
        setLoading(false);
      }
    };

    updateBalance();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-2xl text-green-600">
      {loading ? "Processing payment..." : "Payment Successful! Redirecting..."}
    </div>
  );
}
