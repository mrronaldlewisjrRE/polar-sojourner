import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
    console.log("Testing Order Insert with snake_case fields...");

    // 1. Fetch a valid retailer ID (which is TEXT)
    const { data: retailers, error: retailerError } = await supabase.from('retailers').select('id').limit(1);
    if (retailerError) {
        console.error("❌ Failed to fetch retailers:", retailerError.message);
        return;
    }
    const retailerId = retailers.length > 0 ? retailers[0].id : "TEST-RETAILER-ID";
    console.log(`Using Retailer ID: ${retailerId} (Type: ${typeof retailerId})`);

    const testOrder = {
        retailer_id: retailerId, // Should be TEXT
        vendor_id: null,        // Allow null for now or fetch vendor similarly
        vendor_number: "TEST-123",
        customer_number: "CUST-456",
        internal_email: "test@internal.com",
        order_email: "test@retailer.com",
        auth_number: "AUTH-999",
        total: 100.00,
        items: [{ sku: "TEST-SKU", qty: 1, cost: 100 }],
        created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('orders').insert([testOrder]).select();

    if (error) {
        console.error("❌ Insert Failed:", error.message);
        console.error("Full Error:", JSON.stringify(error, null, 2));

        if (error.code === '42703') { // Undefined column
            console.log("\n-> DIAGNOSIS: The database is missing columns. You MUST run the migration.");
        } else if (error.code === '42P01') { // Undefined table
            console.log("\n-> DIAGNOSIS: The 'orders' table does not exist. You MUST run the migration.");
        } else if (error.code === '22P02') { // Invalid text representation (UUID mismatch)
            console.log("\n-> DIAGNOSIS: Type Mismatch! The database expects UUID but we sent TEXT. Run `fix_column_types.sql`.");
        } else if (error.code === '23503') { // FK violation
            console.log("\n✅ SUCCESS (Schema Valid): Columns exist! The insert failed on Foreign Key constraints because ID doesn't exist, but schema is correct.");
        } else {
            console.log("\n-> DIAGNOSIS: Unexpected error. Check the message above.");
        }
    } else {
        console.log("✅ Insert SUCCEEDED! The database schema is correct.");
        // Cleanup
        if (data && data[0] && data[0].id) {
            await supabase.from('orders').delete().eq('id', data[0].id);
            console.log("Test record deleted.");
        }
    }
}

testInsert();
