const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY);

async function setup() {
  const sql = `
    CREATE TABLE IF NOT EXISTS public.offers (
      id TEXT PRIMARY KEY,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
      data JSONB NOT NULL
    );
    ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Public read access for offers" ON public.offers;
    CREATE POLICY "Public read access for offers" ON public.offers FOR SELECT USING (true);
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON public.offers;
    CREATE POLICY "Enable all access for authenticated users" ON public.offers FOR ALL USING (true) WITH CHECK (true);
  `;
  const { error } = await supabase.rpc('exec_sql', { query: sql });
  if (error) {
    console.log('RPC failed, error:', error);
  } else {
    console.log('Schema created successfully via RPC');
  }
}
setup();
