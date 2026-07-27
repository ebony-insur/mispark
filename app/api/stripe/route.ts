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
        const customerId = session.customer as string;

        if (!userId) break;

        // Retrieve line items to determine the product purchased
        const lineItems = await stripe.checkout.sessions.listLineItems(session.id);
        const isSparkPack = lineItems.data.some(item => item.price?.product === 'prod_UxMoASRnl4acGz');
        const isClassroom = lineItems.data.some(item => item.price?.product === 'prod_UxMsst5r7iZfnl');

        if (isSparkPack) {
            // Process One-off Spark Pack
            const { data: profile } = await supabaseAdmin
                .from("profiles")
                .select("sparks_remaining, subscription_tier")
                .eq("id", userId)
                .single();
            
            const currentSparks = profile?.sparks_remaining || 0;
            // Cap logic: Accommodates up to 3 months of their base tier.
            // Example: If base is 8, max cap is 24.
            const maxCap = 24; 
            const newTotal = Math.min(currentSparks + 4, maxCap);

            await supabaseAdmin.from("profiles").update({ 
                sparks_remaining: newTotal,
                stripe_customer_id: customerId 
            }).eq("id", userId);

            console.log(`Added Spark Pack for user ${userId}. New balance: ${newTotal}`);

        } else {
            // Process Subscription Upgrades
            const planType = session.metadata?.planType || (isClassroom ? "classroom" : "family");
            const tierName = planType === "single" ? "Solo Scholar" : planType === "classroom" ? "Classroom" : "Family Unlimited";

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