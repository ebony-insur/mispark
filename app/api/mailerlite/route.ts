import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, firstName, learnerTier, primaryFocus } = body;

    // Basic validation
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;

    if (!MAILERLITE_API_KEY) {
      console.error("Missing MAILERLITE_API_KEY in environment variables.");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    // Call the MailerLite Subscriber API
    const response = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email: email,
        fields: {
          name: firstName || "",
          // Ensure these custom fields are created exactly like this in your MailerLite dashboard
          learner_tier: learnerTier || "",
          primary_focus: primaryFocus || "",
        },
        // Optional: If you want to dump them straight into a specific campaign group, add the group ID here
        // groups: ["YOUR_GROUP_ID_HERE"], 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("MailerLite API Error:", errorData);
      return NextResponse.json({ error: "Failed to sync with MailerLite" }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Subscriber synced successfully." });
    
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}