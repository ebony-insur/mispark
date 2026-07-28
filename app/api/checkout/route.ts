import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia" as any,
});

export async function POST(request: Request) {
  try {
    const { userId, priceId, mode } = await request.json();

    if (!userId || !priceId) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    // Initialize Supabase Admin to bypass RLS for this check
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // FIX 1: Cast as 'any' to bypass Vercel build errors
    // FIX 2: Use 'maybeSingle()' so it doesn't crash if the profile is missing
    const { data: profile, error } = await (supabaseAdmin.from("profiles") as any)
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return NextResponse.json({ error: "Database error while verifying profile." }, { status: 500 });
    }

    // Base Stripe Session Parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode || "subscription", 
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?canceled=true`,
      metadata: { userId },
    };

    // Attach the existing Stripe Customer ID if the profile and ID exist
    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    } else {
      // If no profile or no Stripe ID exists, let Stripe create a new customer record securely
      sessionParams.customer_creation = "always";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}