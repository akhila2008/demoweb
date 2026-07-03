-- Create store_settings table
CREATE TABLE IF NOT EXISTS public.store_settings (
    id TEXT PRIMARY KEY,
    admin_password TEXT NOT NULL,
    store_name TEXT,
    email TEXT,
    contact_phone TEXT,
    currency TEXT,
    delivery_charge INTEGER,
    free_shipping_threshold INTEGER,
    upi_id TEXT,
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Set up Row Level Security
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- Allow read access to anyone (needed for checkout page and login page)
CREATE POLICY "Enable read for everyone" ON public.store_settings
    FOR SELECT USING (true);

-- Allow update to anyone (since we don't have strict auth roles for admin yet)
CREATE POLICY "Enable update for everyone" ON public.store_settings
    FOR UPDATE USING (true);
    
-- Allow insert to anyone (for initial setup)
CREATE POLICY "Enable insert for everyone" ON public.store_settings
    FOR INSERT WITH CHECK (true);

-- Insert default settings row if it doesn't exist
INSERT INTO public.store_settings (id, admin_password, store_name, email, contact_phone, currency, delivery_charge, free_shipping_threshold, upi_id)
VALUES ('default', 'admin123', 'Akhila Sarees', 'contact@akhilasarees.com', '+91 9876543210', 'INR', 150, 5000, '8143227553@ybl')
ON CONFLICT (id) DO NOTHING;
