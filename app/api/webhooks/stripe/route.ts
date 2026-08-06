import { NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const apiKey = process.env.STRIPE_SECRET_KEY!;
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Initialized with the latest API version (2026-07-29.dahlia)
const stripe = new Stripe(apiKey, {
  apiVersion: "2026-07-29.dahlia" as any,
});

// Robust plan name normalizer to prevent mis-assignment
function normalizeTierName(planType?: string): string {
  if (!planType) return "Gold";
  const lower = planType.toLowerCase();
  if (lower.includes("class")) return "Classroom";
  if (lower.includes("plat") || lower.includes("fam")) return "Platinum";
  if (lower.includes("gold") || lower.includes("sing")) return "Gold";
  return "Gold";
}

// Helper to calculate tier rules (Monthly Sparks & Max Cap = Monthly x 3)
function getTierLimits(tierName: string) {
  switch (tierName) {
    case "Gold":
    case "Solo Scholar":
      return { monthlySparks: 8, maxCap: 24 };
    case "Platinum":
    case "Family Plan":
    case "Family Unlimited":
      return { monthlySparks: 40, maxCap: 120 };
    case "Classroom":
      return { monthlySparks: 240, maxCap: 720 };
    default:
      return { monthlySparks: 8, maxCap: 24 };
  }
}

export async function POST(req: Request) {
  if (!apiKey || !endpointSecret) {
    return NextResponse.json({ error: "Server missing Stripe environment variables" }, { status: 500 });
  }

  const payload = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature header" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Initialize Supabase Admin (Bypasses RLS using service_role key)
  const rawUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/^["']|["']$/g, "");
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  const rawKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim().replace(/^["']|["']$/g, "");
  const supabaseAdmin = createClient(cleanUrl, rawKey);

  try {
    switch (event.type) {
      
      // -------------------------------------------------------------
      // 1. INITIAL CHECKOUT (First Time Purchase or Spark Pack Top-up)
      // -------------------------------------------------------------
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const customerId = session.customer as string;
        const mode = session.mode;

        if (!userId) {
          console.error("❌ SILENT FAILURE: No userId found in Stripe session metadata.");
          return NextResponse.json({ error: "Missing userId metadata" }, { status: 400 });
        }

        console.log(`Webhook triggered for User ID: [${userId}]`);

        // Fetch user profile
        const { data: profile, error: fetchError } = await (supabaseAdmin.from("profiles") as any)
          .select("sparks_remaining, subscription_tier")
          .eq("id", userId)
          .single();

        if (fetchError) {
          console.error(`❌ ERROR FETCHING PROFILE BEFORE UPDATE:`, fetchError);
          return NextResponse.json({ error: "Profile fetch failed" }, { status: 500 });
        }

        const currentSparks = profile?.sparks_remaining || 0;

        if (mode === "payment") {
          // ONE-TIME SPARK PACK (+4 Sparks up to Tier Max Cap)
          const currentTier = profile?.subscription_tier || "Gold";
          const { maxCap } = getTierLimits(currentTier);
          const newTotal = Math.min(currentSparks + 4, maxCap);

          const { data, error } = await (supabaseAdmin.from("profiles") as any)
            .update({ 
              sparks_remaining: newTotal,
              stripe_customer_id: customerId 
            })
            .eq("id", userId)
            .select();

          if (error || !data || data.length === 0) {
            console.error("❌ SUPABASE UPDATE ERROR (Spark Pack):", error);
            return NextResponse.json({ error: "Database update failed" }, { status: 500 });
          }

          console.log(`✅ Added Spark Pack for user ${userId}. New balance: ${newTotal}`);

        } else {
          // NEW SUBSCRIPTION PURCHASE / UPGRADE
          const rawPlanType = session.metadata?.planType;
          const tierName = normalizeTierName(rawPlanType);

          const { monthlySparks, maxCap } = getTierLimits(tierName);
          const newTotal = Math.min(currentSparks + monthlySparks, maxCap);

          const { data, error } = await (supabaseAdmin.from("profiles") as any)
            .update({
              is_subscribed: true,
              subscription_tier: tierName,
              sparks_remaining: newTotal,
              stripe_customer_id: customerId,
            })
            .eq("id", userId)
            .select();

          if (error || !data || data.length === 0) {
            console.error("❌ SUPABASE UPDATE ERROR (Subscription):", error);
            return NextResponse.json({ error: "Database update failed" }, { status: 500 });
          }

          console.log(`✅ Upgraded user ${userId} to ${tierName}. Added ${monthlySparks} Sparks. New total: ${newTotal}`);
        }
        break;
      }

      // -------------------------------------------------------------
      // 2. AUTOMATIC MONTHLY RECURRING CHARGE (Stripe Auto-Renewal)
      // -------------------------------------------------------------
      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        
        if (invoice.billing_reason === "subscription_cycle") {
          const customerId = invoice.customer as string;

          const { data: profile } = await (supabaseAdmin.from("profiles") as any)
            .select("id, sparks_remaining, subscription_tier")
            .eq("stripe_customer_id", customerId)
            .single();

          if (profile) {
            const currentSparks = profile.sparks_remaining || 0;
            const tierName = profile.subscription_tier || "Gold";
            const { monthlySparks, maxCap } = getTierLimits(tierName);
            const newTotal = Math.min(currentSparks + monthlySparks, maxCap);

            const { data, error } = await (supabaseAdmin.from("profiles") as any)
              .update({ sparks_remaining: newTotal })
              .eq("id", profile.id)
              .select();
              
            if (error || !data || data.length === 0) {
              console.error("❌ SUPABASE UPDATE ERROR (Renewal):", error);
              return NextResponse.json({ error: "Database update failed" }, { status: 500 });
            }
            console.log(`✅ Auto-renewal succeeded for ${profile.id}. Added ${monthlySparks} Sparks. New balance: ${newTotal}`);
          }
        }
        break;
      }

      // -------------------------------------------------------------
      // 3. SUBSCRIPTION UPDATES (Upgrades/Downgrades via Stripe Portal)
      // -------------------------------------------------------------
      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        if (subscription.cancel_at_period_end) {
          console.log(`ℹ️ Customer ${customerId} scheduled a cancellation at period end.`);
        }
        break;
      }

      // -------------------------------------------------------------
      // 4. SUBSCRIPTION CANCELLATION
      // -------------------------------------------------------------
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data, error } = await (supabaseAdmin.from("profiles") as any)
          .update({ 
            is_subscribed: false,
            subscription_tier: "Free"
          })
          .eq("stripe_customer_id", customerId)
          .select();

        if (error || !data || data.length === 0) {
          console.error("❌ SUPABASE UPDATE ERROR (Cancellation):", error);
          return NextResponse.json({ error: "Database update failed" }, { status: 500 });
        }
        console.log(`✅ Downgraded customer ${customerId} to free tier.`);
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
//Testing Route Rename to .ts