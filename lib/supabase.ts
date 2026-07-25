import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Explicitly pull the variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables!");
}

// Export a helper function to create the client
export const createClient = () => {
  return createSupabaseClient(supabaseUrl, supabaseAnonKey);
};