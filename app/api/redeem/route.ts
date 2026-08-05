import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const authHeader = req.headers.get("Authorization");

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");

    // 1. Initialize Supabase Admin to bypass RLS securely
    const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
    const supabaseAdmin = createClient(cleanUrl, process.env.SUPABASE_SERVICE_ROLE_KEY!);

    // 2. Verify the user is real
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 3. Define active promo codes
    const validCodes: Record<string, number> = {
      "LAUNCH100": 6, // Gives 6 Sparks
    };

    const normalizedCode = code.trim().toUpperCase();
    const sparksToAdd = validCodes[normalizedCode];

    if (!sparksToAdd) {
      return NextResponse.json({ error: "Code isn't valid" }, { status: 400 });
    }

    // 4. Fetch the user's current profile data
    const { data: profile, error: profileError } = await (supabaseAdmin.from("profiles") as any)
      .select("sparks_remaining, redeemed_codes")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // 5. STRICT RULE: Check if they have ever used ANY promo code
    const previouslyRedeemed = profile.redeemed_codes || [];
    if (previouslyRedeemed.length > 0) {
      return NextResponse.json({ error: "You have already used a promo code. Limit one per account." }, { status: 400 });
    }

    // 6. Calculate new totals
    const currentSparks = profile.sparks_remaining || 0;
    const newSparkTotal = currentSparks + sparksToAdd;
    
    // Add the code they just used to the array so it is no longer empty
    const updatedRedeemedList = [normalizedCode]; 

    // 7. Update the database
    const { error: updateError } = await (supabaseAdmin.from("profiles") as any)
      .update({ 
        sparks_remaining: newSparkTotal,
        redeemed_codes: updatedRedeemedList
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // 8. Return success to the frontend
    return NextResponse.json({ sparksAdded: sparksToAdd }, { status: 200 });

  } catch (error: any) {
    console.error("Promo Code Error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}