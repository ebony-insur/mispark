import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const authHeader = req.headers.get("authorization");

    if (!authHeader) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Initialize Supabase with the user's auth token
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Check if the code is correct
    if (code.toUpperCase() === "LAUNCH100") {
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('sparks_remaining, is_subscribed')
        .eq('id', user.id)
        .single();

      if (profile?.is_subscribed) {
        return NextResponse.json({ error: "You are already a premium member!" }, { status: 400 });
      }

      if (profile?.sparks_remaining >= 6) {
        return NextResponse.json({ error: "Promo already applied!" }, { status: 400 });
      }

      // Update their sparks to 6
      await supabase.from('profiles').update({ sparks_remaining: 6 }).eq('id', user.id);
      
      return NextResponse.json({ success: true, message: "Promo applied! You now have 6 Sparks." });
    }

    return NextResponse.json({ error: "Invalid promo code." }, { status: 400 });
  } catch (error) {
    console.error("Promo Error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}