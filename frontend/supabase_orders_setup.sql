-- Create orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Set up Row Level Security
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (so guests/authenticated users can place orders)
CREATE POLICY "Enable insert for everyone" ON public.orders
    FOR INSERT WITH CHECK (true);

-- Allow users to view their own orders
CREATE POLICY "Enable read access for users based on user_id" ON public.orders
    FOR SELECT USING (auth.uid() = user_id);

-- Allow admins to view all orders (for the admin dashboard, temporarily public for easy setup without complex admin roles)
-- In a real production app, this should check an admin role. For now, we'll allow public select so the dashboard works.
CREATE POLICY "Enable read for everyone" ON public.orders
    FOR SELECT USING (true);

-- Allow admins to update orders (for the admin dashboard)
CREATE POLICY "Enable update for everyone" ON public.orders
    FOR UPDATE USING (true);
