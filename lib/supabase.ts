import { createClient as createSupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

export const createClient = () => {
  // 1. Grab the URL from Vercel
  let rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  
  // 2. THE SLEDGEHAMMER: Forcefully rip "/rest/v1/" off the end if Vercel injected it
  const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, "").replace(/\/$/, "");
  
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!cleanUrl || !supabaseAnonKey) {
    console.error("Missing Supabase variables! URL:", cleanUrl ? "Found" : "Missing", "Key:", supabaseAnonKey ? "Found" : "Missing");
  }

  if (!supabaseInstance) {
    // 3. Pass the CLEANED url to Supabase
    supabaseInstance = createSupabaseClient(cleanUrl, supabaseAnonKey);
  }
  
  return supabaseInstance;
};