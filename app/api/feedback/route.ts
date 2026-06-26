import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize standard Supabase client for backend ops
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Uses the secure service key to award Sparks reliably
);

export async function POST(request: Request) {
  try {
    const { userId, studentId, scheduleId, feedbackItems } = await request.json();

    if (!userId || !feedbackItems || feedbackItems.length === 0) {
      return NextResponse.json({ error: "Missing required data." }, { status: 400 });
    }

    // 1. Save all the individual ratings and comments
    const recordsToInsert = feedbackItems.map((item: any) => ({
      user_id: userId,
      student_id: studentId,
      schedule_id: scheduleId,
      category: item.category,
      title: item.title,
      was_used: item.wasUsed,
      rating: item.rating, // 1 to 5
      parent_notes: item.notes
    }));

    const { error: insertError } = await supabase
      .from("recommendation_feedback")
      .insert(recordsToInsert);

    if (insertError) throw insertError;

    // 2. Award 10 Free Sparks for participating in the review!
    // First, get their current token balance
    const { data: profileData } = await supabase
      .from("profiles")
      .select("tokens")
      .eq("id", userId)
      .single();

    const currentTokens = profileData?.tokens || 0;
    const newTokens = currentTokens + 10; // Reward amount

    // Update their balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ tokens: newTokens })
      .eq("id", userId);

    if (updateError) throw updateError;

    return NextResponse.json({ 
      message: "Feedback saved!", 
      sparksAwarded: 10,
      newTotal: newTokens 
    }, { status: 200 });

  } catch (error) {
    console.error("Feedback Save Error:", error);
    return NextResponse.json({ error: "Failed to save feedback." }, { status: 500 });
  }
}
