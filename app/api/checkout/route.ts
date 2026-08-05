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

    // 1. Sanitize Base URL (Strips spaces AND accidental quotation marks)
    let rawBaseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "https://www.mi-spark.com").trim();
    rawBaseUrl = rawBaseUrl.replace(/^["']|["']$/g, ""); // Destroys quotes
    
    if (!rawBaseUrl.startsWith("http://") && !rawBaseUrl.startsWith("https://")) {
      rawBaseUrl = `https://${rawBaseUrl}`;
    }
    const baseUrl = rawBaseUrl.replace(/\/$/, "");

    // Let's log exactly what we are sending so we can see it in Vercel!
    const successUrlToStripe = `${baseUrl}/dashboard?success=true`;
    console.log("🚀 SENDING SUCCESS URL TO STRIPE:", successUrlToStripe);

    // 2. Initialize Supabase Admin
    let rawSupabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim();
    rawSupabaseUrl = rawSupabaseUrl.replace(/^["']|["']$/g, ""); 
    const cleanSupabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
    
    let rawSupabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();
    rawSupabaseKey = rawSupabaseKey.replace(/^["']|["']$/g, "");
    
    const supabaseAdmin = createClient(cleanSupabaseUrl, rawSupabaseKey);

    // 3. Fetch user profile
    const { data: profile, error } = await (supabaseAdmin.from("profiles") as any)
      .select("stripe_customer_id")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Profile fetch error:", error);
      return NextResponse.json({ error: "Database error while verifying profile." }, { status: 500 });
    }

    // 4. Map plan types
    const planType = 
      priceId === "price_1Tx7p1F035PE8L5xqpQM4t3N" ? "single" : 
      priceId === "price_1TxS8KF035PE8L5xuMDlFLVc" ? "classroom" : 
      "family";

    const sessionMode = mode || "subscription";

    // 5. Build Stripe Checkout Session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      line_items: [{ price: priceId, quantity: 1 }],
      mode: sessionMode, 
      success_url: successUrlToStripe,
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