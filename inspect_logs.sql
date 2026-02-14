SELECT column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'sku_logs';
SELECT *
FROM sku_logs
LIMIT 5;