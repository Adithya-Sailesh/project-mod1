import { db } from "../../../firebaseConfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId, amount, paymentMethod } = await req.json();

    if (!userId || !amount || !paymentMethod) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const transactionRef = doc(db, "recharge_transactions", `${userId}_${Date.now()}`);
    await setDoc(transactionRef, {
      userId,
      amount,
      timestamp: Timestamp.now(),
      status: "Success",
      paymentMethod,
    });

    return NextResponse.json({ message: "Transaction recorded successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error saving transaction:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
