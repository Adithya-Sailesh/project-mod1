import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "../../firebaseConfig";
import { doc, setDoc, Timestamp } from "firebase/firestore";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(req) {
  const sig = req.headers.get("stripe-signature");
  let event;

  try {
    const body = await req.text();
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook Error:", err.message);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata.userId;  //  user ID
    const amount = session.amount_total / 100;  // cent to rupees

    try {
      const rechargeRef = doc(db, "recharge_transactions", session.id);
      await setDoc(rechargeRef, {
        userId,
        amount,
        timestamp: Timestamp.now(),
        status: "Success",
        paymentMethod: session.payment_method_types[0],  // e.g., "card"
      });

      console.log("Recharge transaction stored for user:", userId);
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  }

  return NextResponse.json({ received: true });
}
