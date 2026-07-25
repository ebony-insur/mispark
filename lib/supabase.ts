import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Explicitly pull the variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
}

// 1. Create a variable to hold our single, reusable connection
let supabaseInstance: ReturnType<typeof createSupabaseClient> | null = null;

// 2. Update the helper function to only create the client ONCE
export const createClient = () => {
  if (!supabaseInstance) {
    // If it doesn't exist yet, create it
    supabaseInstance = createSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  
  // Return the existing connection
  return supabaseInstance;
};