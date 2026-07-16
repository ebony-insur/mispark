import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16" as any,
});

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    
    // Search Stripe for the customer matching this email
    const customers = await stripe.customers.list({ email, limit: 1 });
    const customerId = customers.data[0]?.id;

    if (!customerId) {
      return NextResponse.json({ error: "No active Stripe customer found for this email." }, { status: 404 });
    }

    // Generate a secure, temporary link to the Stripe Portal
    const origin = req.headers.get("origin") || "http://localhost:3000";
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/billing`,
    });

    return NextResponse.json({ url: portalSession.url }, { status: 200 });
  } catch (error) {
    console.error("Stripe Portal Error:", error);
    return NextResponse.json({ error: "Failed to generate portal link." }, { status: 500 });
  }
}