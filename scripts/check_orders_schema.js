import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
    console.log("Checking 'orders' table columns...");
    // Attempt to insert a dummy record with a non-existent column to trigger an error that *might* list valid columns, 
    // or just checking a known record. 
    // Supabase JS doesn't have a simple "describe table" method for Anon clients usually.
    // But we can infer from a select.

    const { data, error } = await supabase.from('orders').select('*').limit(1);

    if (error) {
        console.error("Error selecting:", error.message);
    } else if (data.length > 0) {
        console.log("Columns found in existing row:", Object.keys(data[0]));
        console.log("Table is empty. Testing specific column existence...");

        // Test 1: credit_auth_number
        const { error: err1 } = await supabase.from('orders').insert({ 'credit_auth_number': 'test' });
        if (err1 && err1.message.includes("Could not find the 'credit_auth_number' column")) {
            console.log("❌ 'credit_auth_number' DOES NOT exist.");
        } else {
            console.log("✅ 'credit_auth_number' exists (or different error).");
        }

        // Test 2: auth_number
    } else {
        console.log("Table is empty, cannot infer columns from data. Trying invalid insert to get hint...");
        const { error: insertError } = await supabase.from('orders').insert({ 'invalid_col_123': 1 });
        if (insertError) {
            console.log("Insert Error (may contain hints):", insertError.message);
        }
    }

    // Always test specific columns
    console.log("Testing specific column existence...");

    // Test 1: credit_auth_number
    const { error: err1 } = await supabase.from('orders').insert({ 'credit_auth_number': 'test' });
    if (err1 && err1.message.includes("Could not find the 'credit_auth_number' column")) {
        console.log("❌ 'credit_auth_number' DOES NOT exist.");
    } else {
        console.log("✅ 'credit_auth_number' exists (or different error: " + (err1 ? err1.message : "none") + ")");
    }

    // Test 2: auth_number
    const { error: err2 } = await supabase.from('orders').insert({ 'auth_number': 'test' });
    if (err2 && err2.message.includes("Could not find the 'auth_number' column")) {
        console.log("❌ 'auth_number' DOES NOT exist.");
    } else {
        console.log("✅ 'auth_number' exists (or different error: " + (err2 ? err2.message : "none") + ")");
    }
}

checkColumns();
