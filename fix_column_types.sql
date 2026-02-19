-- FIX COLUMN TYPES
-- If the columns were already created as UUID, we need to convert them to TEXT to match the retailers/vendors tables.
ALTER TABLE orders
ALTER COLUMN retailer_id TYPE text,
    ALTER COLUMN vendor_id TYPE text;
-- Re-verify foreign keys if needed (Supabase usually handles this if types match, but explicit FK constraints might need dropping/re-adding)
-- For now, just fixing the type is the critical step.