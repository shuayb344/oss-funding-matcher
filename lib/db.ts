import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Supabase client for use in Server Components and API routes.
 * Uses the service role key to bypass RLS for trusted server-side operations.
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseServiceKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

/**
 * Supabase client for use in Client Components.
 * Uses the anon key only — respects RLS policies.
 */
export function createBrowserClient() {
  return createClient(supabaseUrl, supabaseAnonKey);
}
