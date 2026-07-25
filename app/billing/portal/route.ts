import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    // 1. Grab the key inside the function
    const apiKey = process.env.STRIPE_SECRET_KEY;
    
    if (!apiKey) {
      console.error("Missing STRIPE_SECRET_KEY");
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    // 2. Initialize Stripe INSIDE the handler
    const stripe = new Stripe(apiKey, {
      apiVersion: "2026-06-24.dahlia",
    });

    const { customerId } = await req.json();

    if (!customerId) {
      return NextResponse.json({ error: "Customer ID is required" }, { status: 400 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // 3. Create the Stripe Customer Portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${baseUrl}/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json({ error: error.message || "Failed to create portal session" }, { status: 500 });
  }
}