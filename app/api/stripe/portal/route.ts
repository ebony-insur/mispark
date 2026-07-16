import { NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-04-10", // Using a stable API version
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      console.error("Missing STRIPE_SECRET_KEY in environment variables.");
      return NextResponse.json({ error: "Server configuration error." }, { status: 500 });
    }

    // 1. Search your Stripe account for a customer with this email
    const customers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    // 2. If they don't exist in Stripe yet, we can't open a portal
    if (customers.data.length === 0) {
      return NextResponse.json({ 
        error: "No active billing profile found. You need to subscribe to a plan first!" 
      }, { status: 404 });
    }

    const customerId = customers.data[0].id;

    // 3. Generate the secure Stripe Portal link
    // It will return them back to your app when they click "Return to MiSpark"
    const returnUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000/billing";
    
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    // 4. Send the URL back to your frontend so the button can redirect the user
    return NextResponse.json({ url: portalSession.url }, { status: 200 });

  } catch (error: any) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json({ error: "Failed to connect to Stripe." }, { status: 500 });
  }
}