import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing STRIPE_SECRET_KEY" }, { status: 500 });
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: "2026-06-24.dahlia",
    });

    // Accept planType ("single" or "family") from the frontend
    const { userId, email, planType = "family" } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "User ID and Email required" }, { status: 400 });
    }

    // Select the correct Price ID based on the requested plan
    const stripePriceId = planType === "single" 
      ? process.env.STRIPE_PRICE_ID_SINGLE 
      : process.env.STRIPE_PRICE_ID_FAMILY;

    if (!stripePriceId) {
      return NextResponse.json({ error: `Price ID for plan '${planType}' is missing.` }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      customer_email: email,
      line_items: [{ price: stripePriceId, quantity: 1 }],
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/dashboard?canceled=true`,
      metadata: {
        userId: userId,
        planType: planType // Pass plan type to webhook
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}