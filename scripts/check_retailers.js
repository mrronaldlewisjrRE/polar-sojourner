import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRetailers() {
    console.log("Checking retailers table...");
    const { data, error } = await supabase.from('retailers').select('*').limit(1);

    if (error) {
        console.error("Error fetching retailers:", error);
    } else {
        console.log("Retailers table access successful.");
        console.log("Row count:", data.length);
        if (data.length > 0) {
            console.log("First row keys:", Object.keys(data[0]));
        }
    }
}

checkRetailers();
