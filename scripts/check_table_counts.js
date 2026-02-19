
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    console.log("Checking Supabase Data...");

    const { count: vendorCount, error: vendorError } = await supabase.from('vendors').select('*', { count: 'exact', head: true });
    if (vendorError) console.error("Error fetching vendors:", vendorError);
    else console.log(`Vendors Count: ${vendorCount}`);

    const { count: eventCount, error: eventError } = await supabase.from('events').select('*', { count: 'exact', head: true });
    if (eventError) console.error("Error fetching events:", eventError);
    else console.log(`Events Count: ${eventCount}`);

    // Also check if we get any data at all to verify schema/access
    const { data: vData } = await supabase.from('vendors').select('*').limit(1);
    console.log("Sample Vendor:", vData && vData.length > 0 ? vData[0] : "None");
}

checkData();
