import { db } from "../../../firebaseConfig";
import { collection, query, where, getDocs, updateDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { vehicleNumber, amount } = await req.json();
    if (!vehicleNumber || !amount) {
      return new Response(JSON.stringify({ error: "Invalid input" }), { status: 400 });
    }

    // 🔍 Search for user with matching vehicle number
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("vehicleNumber", "==", vehicleNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return new Response(JSON.stringify({ error: "User not found" }), { status: 404 });
    }

    // Get first matching user document
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    if (userData.balance < amount) {
      return new Response(JSON.stringify({ error: "Insufficient balance" }), { status: 400 });
    }

    // Deduct amount
    await updateDoc(userDoc.ref, {
      balance: userData.balance - amount,
    });

    return new Response(JSON.stringify({ message: "Toll fee deducted successfully" }), { status: 200 });
  } catch (error) {
    console.error("Error deducting toll fee:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}
