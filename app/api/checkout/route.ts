import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-07-29.dahlia" as any,
});

export async function POST(req: Request) {
  try {
    const { userId, priceId, mode } = await req.json();

    if (!userId || !priceId) {
      return NextResponse.json({ error: "Missing required fields: userId or priceId" }, { status: 400 });
    }

    // Determine plan type from Price ID
    let planType = "single";
    if (priceId === "price_1Tx7p6F035PE8L5x6tZ4zLYx") planType = "family";
    if (priceId === "price_1TxS8KF035PE8L5xuMDlFLVc") planType = "classroom";
    if (priceId === "price_1Tx7p1F035PE8L5xqpQM4t3N") planType = "single";

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.mi-spark.com";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode === "payment" ? "payment" : "subscription",
      success_url: `${siteUrl}/dashboard?success=true`,
      cancel_url: `${siteUrl}/billing?canceled=true`,
      metadata: {
        userId,
        planType,
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Checkout session creation error:", error);
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 });
  }
}