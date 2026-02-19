import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyProjectAndTables() {
    console.log("---------------------------------------------------");
    console.log("🔍 Verifying Supabase Project Connection & Tables");
    console.log("---------------------------------------------------");

    // 1. Extract Project ID from URL
    const projectIdMatch = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    const projectId = projectIdMatch ? projectIdMatch[1] : 'UNKNOWN_FORMAT';

    console.log(`✅ Configured Project URL: ${supabaseUrl}`);
    console.log(`✅ Extracted Project ID:  ${projectId}`);

    // (Note: We cannot programmatically check the "Dashboard" project ID as we don't have dashboard access.
    // We assume this ID from .env is the intended one. The user must visually verify if valid.)

    console.log("\n🔍 Checking Tables...");

    // 2. Check Vendors
    const { data: vendors, error: vError } = await supabase.from('vendors').select('*').limit(1);

    if (vError) {
        if (vError.code === '42P01') {
            console.log(`❌ Table 'vendors': MISSING (Error: ${vError.message})`);
        } else {
            console.log(`❌ Table 'vendors': ACCESS ERROR (Error: ${vError.message})`);
        }
    } else {
        console.log(`✅ Table 'vendors': EXISTS (Accessible)`);
    }

    // 3. Check Distributors
    const { data: distributors, error: dError } = await supabase.from('distributors').select('*').limit(1);

    if (dError) {
        if (dError.code === '42P01') {
            console.log(`❌ Table 'distributors': MISSING (Error: ${dError.message})`);
        } else {
            console.log(`❌ Table 'distributors': ACCESS ERROR (Error: ${dError.message})`);
        }
    } else {
        console.log(`✅ Table 'distributors': EXISTS (Accessible)`);
    }

    console.log("---------------------------------------------------");
}

verifyProjectAndTables();
