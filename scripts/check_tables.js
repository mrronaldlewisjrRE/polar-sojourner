import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
    console.log("Checking tables...");

    const tables = ['vendors', 'distributors', 'retailers', 'products', 'events'];

    for (const table of tables) {
        const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });

        if (error) {
            console.log(`❌ Table '${table}': ERROR - ${error.message} (Likely does not exist)`);
        } else {
            console.log(`✅ Table '${table}': Exists (Rows: ${count})`);
        }
    }
}

checkTables();
