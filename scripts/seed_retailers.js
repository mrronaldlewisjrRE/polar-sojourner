import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { RETAILERS } from '../src/data/retailers.js';

// Load Environment Variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Missing Supabase Credentials in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedRetailers() {
    console.log(`📦 Preparing to seed ${RETAILERS.length} retailers...`);

    // Batch insert to avoid payload limits
    const BATCH_SIZE = 100;
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < RETAILERS.length; i += BATCH_SIZE) {
        const batch = RETAILERS.slice(i, i + BATCH_SIZE).map(r => ({
            id: r.id.toString(), // Ensure string
            name: r.name,
            address: r.address,
            city: r.city,
            state: r.state,
            zip: r.zip ? r.zip.toString() : null,
            contact_name: r.contactName, // Map camelCase to snake_case
            email: r.email,
            phone: r.phone,
            notes: r.notes,
            // Assuming 'accounts' is a JSONB column or we skip it for now
            // If schema doesn't have 'accounts', this might error if we send it?
            // Let's strip it unless we know schema has it.
            // Check schema first, but safe to omit if not needed for Geocoding.
        }));

        const { error } = await supabase
            .from('retailers')
            .upsert(batch, { onConflict: 'id', ignoreDuplicates: true });

        if (error) {
            console.error(`❌ Batch ${i} failed:`, error.message);
            failed += batch.length;
        } else {
            process.stdout.write('.'); // Progress dot
            successful += batch.length;
        }
    }

    console.log(`\n\n✅ Seeding Complete!`);
    console.log(`👍 Indexed: ${successful}`);
    console.log(`👎 Failed: ${failed}`);
}

seedRetailers();
