/* =============================
 SUPABASE MIGRATION
 File: create_sku_logs_table.sql
 ============================= */
-- Create sku_logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.sku_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    sku text NOT NULL,
    status text,
    method text,
    metadata jsonb
);
-- Enable RLS
ALTER TABLE public.sku_logs ENABLE ROW LEVEL SECURITY;
-- Policies
-- Allow anyone (authenticated) to insert logs (e.g. from tracker)
CREATE POLICY "Enable insert for authenticated users only" ON public.sku_logs FOR
INSERT TO authenticated WITH CHECK (true);
-- Allow admins to view all logs
CREATE POLICY "Admins can view all logs" ON public.sku_logs FOR
SELECT TO authenticated USING (
        (
            SELECT role
            FROM public.profiles
            WHERE id = auth.uid()
        ) = 'admin'
    );