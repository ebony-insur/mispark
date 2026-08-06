import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

    // 3. Initialize the Admin Client to perform the hard deletion
    const supabaseAdmin = createClient(
      cleanUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 4. Delete the user (This removes auth identity and triggers cascade deletion for profiles/plans)
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    
    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true }, { status: 200 });
    
  } catch (error: any) {
    console.error("Delete Account Error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}