-- Fix Vendors Table
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
UPDATE public.vendors
SET status = 'Active'
WHERE status IS NULL;
-- Fix Events Table
-- Ensure all columns expected by Calendar.jsx exist
-- event = { date, time, title, type, notes, images }
ALTER TABLE public.events
ADD COLUMN IF NOT EXISTS title text,
    ADD COLUMN IF NOT EXISTS date date,
    ADD COLUMN IF NOT EXISTS time text,
    ADD COLUMN IF NOT EXISTS type text DEFAULT 'Schedule',
    ADD COLUMN IF NOT EXISTS notes text,
    ADD COLUMN IF NOT EXISTS images jsonb DEFAULT '[]'::jsonb;
-- Optional: Comments
COMMENT ON COLUMN public.events.type IS 'Schedule, Show, or Note';