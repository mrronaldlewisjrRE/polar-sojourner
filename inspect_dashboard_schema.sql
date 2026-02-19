-- Check profiles schema
SELECT column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'profiles';
-- Check sku_logs schema (if exists)
SELECT column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'sku_logs';