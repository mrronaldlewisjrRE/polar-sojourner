import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { RETAILERS } from '../src/data/retailers.js'; // Import original data

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function seedRetailers() {
    console.log(`Preparing to seed ${RETAILERS.length} retailers...`);

    // Transform to snake_case for DB
    const dbRetailers = RETAILERS.map(r => ({
        id: r.id.toString(), // Ensure string ID
        name: r.name,
        location: r.location,
        address: r.address,
        city: r.city,
        state: r.state,
        zip: r.zip ? r.zip.toString() : null,
        warehouse_code: r.warehouseCode,
        contact_name: r.contactName,
        email: r.email,
        phone: r.phone,
        cell: r.cell,
        notes: r.notes,
        accounts: r.accounts || {},
        is_favorite: false
    }));

    // Batch insert (Supabase limit is usually high, but let's do batches of 100)
    const BATCH_SIZE = 100;
    for (let i = 0; i < dbRetailers.length; i += BATCH_SIZE) {
        const batch = dbRetailers.slice(i, i + BATCH_SIZE);
        const { error } = await supabase.from('retailers').upsert(batch, { onConflict: 'id' });

        if (error) {
            console.error(`Error inserting batch ${i}:`, error);
        } else {
            console.log(`Inserted batch ${i} - ${i + batch.length}`);
        }
    }

    console.log("Seeding complete.");
}

seedRetailers();
