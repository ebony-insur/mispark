import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20" as any,
});

export async function POST(request: Request) {
  try {
    const { userId, priceId, mode } = await request.json();

    if (!userId || !priceId) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    // 1. Sanitize Base URL to prevent Stripe "url_invalid" errors
    let rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.mi-spark.com";
    if (!rawBaseUrl.startsWith("http://") && !rawBaseUrl.startsWith("https://")) {
      rawBaseUrl = `https://${rawBaseUrl}`;
    }
    const baseUrl = rawBaseUrl.replace(/\/$/, "");

    // 2. Initialize Supabase Admin
    const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const cleanSupabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
    const supabaseAdmin = createClient(cleanSupabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // 3. Fetch user profile to check for existing Stripe Customer ID
    const { data: profile, error } = await (supabaseAdmin.from("profiles") as any)
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return NextResponse.json({ error: "Database error while verifying profile." }, { status: 500 });
    }

    // 4. Map plan types for webhook processing
    const planType = 
      priceId === "price_1Tx7p1F035PE8L5xqpQM4t3N" ? "single" : 
      priceId === "price_1TxS8KF035PE8L5xuMDlFLVc" ? "classroom" : 
      "family";

    const sessionMode = mode || "subscription";

    // 5. Build Stripe Checkout Session Parameters
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [{ price: priceId, quantity: 1 }],
      mode: sessionMode, 
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/billing?canceled=true`,
      metadata: { userId, planType },
    };

    if (profile?.stripe_customer_id) {
      sessionParams.customer = profile.stripe_customer_id;
    } else if (sessionMode === "payment") {
      sessionParams.customer_creation = "always";
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}