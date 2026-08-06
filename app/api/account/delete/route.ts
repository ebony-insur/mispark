import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

// Initialize Stripe (Ensure STRIPE_SECRET_KEY is in your .env.local file)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Replace with your specific API version if needed
});

export async function DELETE(req: Request) {
  try {
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");

    // 1. Get the user's token from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify exactly who is making this request
    const supabaseAuth = createClient(
      cleanUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );
    
    const { data: authData, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !authData.user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const userId = authData.user.id;

    // 3. Initialize the Admin Client to bypass RLS for administrative actions
    const supabaseAdmin = createClient(
      cleanUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Fetch their profile to get the Stripe Customer ID
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    // 5. Cancel any active Stripe subscriptions BEFORE deleting the user
    if (profile?.stripe_customer_id) {
      const subscriptions = await stripe.subscriptions.list({
        customer: profile.stripe_customer_id,
        status: 'active',
      });

      // Loop through and cancel all active subscriptions for this customer
      for (const sub of subscriptions.data) {
        await stripe.subscriptions.cancel(sub.id);
      }
    }

    // 6. Delete the user from Supabase (Relies on your ON DELETE CASCADE settings)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);
    
    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error: any) {
    console.error("Delete Account Error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}