-- Add status column to vendors table
ALTER TABLE public.vendors
ADD COLUMN IF NOT EXISTS status text DEFAULT 'Active';
-- Update existing vendors to Active if null
UPDATE public.vendors
SET status = 'Active'
WHERE status IS NULL;