import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// 1. Create a variable to hold our single, reusable connection
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

// 2. Update the helper function to pull variables INSIDE the function
export const createClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables! URL:", supabaseUrl ? "Found" : "Missing", "Key:", supabaseAnonKey ? "Found" : "Missing");
  }

  if (!supabaseInstance) {
    // If it doesn't exist yet, create it
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  
  // Return the existing connection
  return supabaseInstance;
};