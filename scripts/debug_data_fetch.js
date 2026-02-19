import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugFetch() {
    console.log("Debugging Data Fetch (Anon Key)...");

    // 1. Vendors
    const { data: vendors, error: vError } = await supabase.from('vendors').select('*').limit(3);
    if (vError) console.log("❌ Vendors Error:", vError.message);
    else console.log(`✅ Vendors Data: Found ${vendors.length} rows. Sample:`, vendors[0]);

    // 2. Distributors
    const { data: distributors, error: dError } = await supabase.from('distributors').select('*').limit(3);
    if (dError) console.log("❌ Distributors Error:", dError.message);
    else console.log(`✅ Distributors Data: Found ${distributors.length} rows. Sample:`, distributors[0]);
    // 3. Events
    const { data: events, error: eError } = await supabase.from('events').select('*').limit(3);
    if (eError) console.log("❌ Events Error:", eError.message);
    else console.log(`✅ Events Data: Found ${events.length} rows.`);
}

debugFetch();
