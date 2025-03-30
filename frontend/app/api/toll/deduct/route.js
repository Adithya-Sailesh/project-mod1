import { db } from "../../../firebaseConfig";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { vehicleNumber, amount } = await req.json();
    if (!vehicleNumber || !amount) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
    }

    const usersRef = collection(db, "users");
    const q = query(usersRef, where("vehicleNumber", "==", vehicleNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // 🚨 Check if user is already blacklisted
    if (userData.blacklisted) {
      return new Response(JSON.stringify({ error: "User is blacklisted. Toll processing denied." }), { status: 403 });
    }

    let deductedAmount = amount;
    let newBalance = userData.balance - amount;
    let insufficientAttempts = userData.insufficientAttempts || 0;

    // 🚨 If balance is insufficient, deduct double the toll
    if (userData.balance < amount) {
      deductedAmount = 2 * amount;
      newBalance = userData.balance - deductedAmount;
      insufficientAttempts += 1;
    } else {
      insufficientAttempts = 0; // Reset count if balance was sufficient
    }

    let updateData = {
      balance: newBalance,
      lastTransaction: deductedAmount,
      insufficientAttempts,
    };

    // 🚨 Blacklist user after 3 failed attempts
    if (insufficientAttempts >= 3) {
      updateData.blacklisted = true;
    }

    await updateDoc(userDoc.ref, updateData);

    return new Response(
      JSON.stringify({
        deductedAmount,
        newBalance,
        blacklisted: updateData.blacklisted || false,
        insufficientAttempts,
      }),
      { status: 200 }
    );

  } catch (error) {
    console.error("Error processing toll fee:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
