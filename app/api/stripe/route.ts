import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const apiKey = process.env.STRIPE_SECRET_KEY;
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!apiKey || !endpointSecret) {
    return NextResponse.json({ error: "Server missing Stripe environment variables" }, { status: 500 });
  }

  const stripe = new Stripe(apiKey, {
    apiVersion: "2026-06-24.dahlia",
  });

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const planType = session.metadata?.planType || "family";
        const customerId = session.customer as string;

        // Convert key to display tier string for Students Page checks
        const tierName = planType === "single" ? "Solo Scholar" : "Family Unlimited";

        if (userId) {
          const { error } = await supabaseAdmin
            .from("profiles")
            .update({
              is_subscribed: true,
              subscription_tier: tierName,
              stripe_customer_id: customerId,
            })
            .eq("id", userId);

          if (error) throw error;
          console.log(`Successfully upgraded user ${userId} to ${tierName}`);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { error } = await supabaseAdmin
          .from("profiles")
          .update({ 
            is_subscribed: false,
            subscription_tier: "free"
          })
          .eq("stripe_customer_id", customerId);

        if (error) throw error;
        console.log(`Downgraded customer ${customerId} to free`);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }
}