-- Create offers table
CREATE TABLE IF NOT EXISTS public.offers (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    code TEXT,
    discount TEXT NOT NULL,
    status TEXT DEFAULT 'Active',
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Allow read access to anyone (needed for checkout page validation and displaying offers on frontend)
CREATE POLICY "Enable read for everyone" ON public.offers
    FOR SELECT USING (true);

-- Allow insert to anyone (since we don't have strict auth roles for admin yet)
CREATE POLICY "Enable insert for everyone" ON public.offers
    FOR INSERT WITH CHECK (true);

-- Allow update to anyone
CREATE POLICY "Enable update for everyone" ON public.offers
    FOR UPDATE USING (true);
    
-- Allow delete to anyone
CREATE POLICY "Enable delete for everyone" ON public.offers
    FOR DELETE USING (true);
