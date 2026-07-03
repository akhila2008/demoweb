import { createClient } from '@supabase/supabase-js';

// This client uses the SERVICE_ROLE_KEY to bypass Row Level Security.
// ONLY USE THIS ON THE SERVER (API Routes, Server Actions).
// NEVER expose the service role key to the client.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase URL or Service Role Key");
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});
