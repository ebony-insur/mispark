import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia" as any,
});

export async function POST(request: Request) {
  try {
    const { userId, priceId, mode } = await request.json();

    if (!userId || !priceId) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    // --- FIX 1: Vercel URL Sledgehammer ---
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

    const supabaseAdmin = createClient(cleanUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    const { data: profile, error } = await (supabaseAdmin.from("profiles") as any)
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return NextResponse.json({ error: "Database error while verifying profile." }, { status: 500 });
    }

    // --- FIX 2: Identify Plan Type for the Webhook ---
    const planType = 
      priceId === "price_1Tx7p1F035PE8L5xqpQM4t3N" ? "single" : 
      priceId === "price_1TxS8KF035PE8L5xuMDlFLVc" ? "classroom" : 
      "family";

    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode || "subscription", 
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?canceled=true`,
      metadata: { userId, planType }, // Passed to Webhook
    };

    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    } else {
      sessionParams.customer_creation = "always";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}