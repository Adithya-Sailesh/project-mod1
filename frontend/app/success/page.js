"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function Success() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const updateBalance = async () => {
      try {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
          if (user) {
            console.log("User authenticated:", user.uid);

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
              const currentBalance = userSnap.data().balance || 0;
              const rechargeAmount = Number(sessionStorage.getItem("rechargeAmount") || 0);
              const transactionId = sessionStorage.getItem("transactionId");

              if (rechargeAmount > 0 && transactionId) {
                const transactionRef = doc(db, "recharge_transactions", transactionId);
                const transactionSnap = await getDoc(transactionRef);

                if (!transactionSnap.exists()) {
                  const newBalance = currentBalance + rechargeAmount;

                  // Update user balance
                  await updateDoc(userRef, { balance: newBalance });

                  // Store transaction with balance details
                  await setDoc(transactionRef, {
                    userId: user.uid,
                    amount: rechargeAmount,
                    balanceBefore: currentBalance,
                    balanceAfter: newBalance,
                    timestamp: new Date(),
                    status: "Success",
                  });

                  console.log("Recharge transaction recorded successfully.");
                } else {
                  console.log("Transaction already recorded. Skipping duplicate entry.");
                }

                // Clear session data
                sessionStorage.removeItem("rechargeAmount");
                sessionStorage.removeItem("transactionId");
              }
            }

            router.push("/user");
          } else {
            console.error("User not authenticated.");
          }

          setLoading(false);
          unsubscribe();
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
