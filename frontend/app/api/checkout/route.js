import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"; // Default to localhost

export async function POST(req) {
  try {
    const body = await req.json();
    console.log("Received request body:", body); // Debugging log

    const { amount, userId } = body; // Extracting userId and amount

    // Validate required fields
    if (!amount || !userId) {
      console.error("Error: Amount or userId is missing!");
      return NextResponse.json({ error: "Amount and userId are required" }, { status: 400 });
    }

    // Create a Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "required",
      customer_email: "customer@example.com", // Optional: Replace with actual user email
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "Wallet Recharge",
              description: "Recharge for Auto-ID wallet",
            },
            unit_amount: amount, // Amount in cents (e.g., ₹50 = 5000 paise)
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/recharge`,
      metadata: { userId }, // Store userId in metadata for later use
    });

    console.log("Created Stripe session:", session);
    return NextResponse.json({ id: session.id });
  } catch (error) {
    console.error("Stripe error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
