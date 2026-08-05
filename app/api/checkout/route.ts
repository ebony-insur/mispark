import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Missing Stripe secret key on server." }, { status: 500 });
    }

    const stripe = new Stripe(apiKey, {
      apiVersion: "2024-06-20" as any,
    });

    const { userId, priceId, mode = "subscription" } = await req.json();

    if (!userId || !priceId) {
      return NextResponse.json({ error: "Missing required parameters (userId or priceId)." }, { status: 400 });
    }

    // 1. Determine base URL with fallback to production domain
    let rawBaseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.mi-spark.com";

    // 2. Ensure URL has a valid protocol (https:// or http://)
    if (!rawBaseUrl.startsWith("http://") && !rawBaseUrl.startsWith("https://")) {
      rawBaseUrl = `https://${rawBaseUrl}`;
    }

    // 3. Remove trailing slash if present
    const baseUrl = rawBaseUrl.replace(/\/$/, "");

    // 4. Construct Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode as Stripe.Checkout.Session.CreateParams.Mode,
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/billing`,
      metadata: {
        userId: userId,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create Stripe checkout session." },
      { status: 500 }
    );
  }
}