-- Create retailers table
CREATE TABLE IF NOT EXISTS public.retailers (
    id text PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    name text NOT NULL,
    location text,
    address text,
    city text,
    state text,
    zip text,
    -- Mapped columns (CamelCase in Code -> SnakeCase in DB)
    warehouse_code text,
    contact_name text,
    email text,
    phone text,
    cell text,
    notes text,
    accounts jsonb DEFAULT '{}'::jsonb,
    is_favorite boolean DEFAULT false
);
-- RLS Policies
ALTER TABLE public.retailers ENABLE ROW LEVEL SECURITY;
-- Allow read access to authenticated users
CREATE POLICY "Enable read access for all users" ON public.retailers FOR
SELECT USING (true);
-- Allow insert/update/delete for authenticated users (Team members)
CREATE POLICY "Enable insert for authenticated users" ON public.retailers FOR
INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users" ON public.retailers FOR
UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users" ON public.retailers FOR DELETE USING (auth.role() = 'authenticated');
-- Grant access
GRANT ALL ON TABLE public.retailers TO authenticated;
GRANT ALL ON TABLE public.retailers TO service_role;