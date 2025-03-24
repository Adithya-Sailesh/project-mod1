import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Default to localhost

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);

    const { amount } = body;
    if (!amount) {
      console.error("Amount is missing!");
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required", // Require billing details
      customer_email: "customer@example.com", // (Optional) Prefill email if available
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: { 
              name: "Wallet Recharge",
              description: "Recharge for Auto-ID wallet", 
            },
            unit_amount: amount, // Ensure amount is in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${BASE_URL}/success`,
      cancel_url: `${BASE_URL}/recharge`,
    });

    console.log("Created Stripe session:", session);
    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
