
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

async function restoreData() {
    console.log("Starting Data Restoration...");

    // 1. Fix Vendor Status
    console.log("Fixing Vendor Status...");
    const { data: vendors, error: vError } = await supabase.from('vendors').select('id, status');
    if (vError) {
        console.error("Error fetching vendors:", vError);
    } else {
        const vendorsToFix = vendors.filter(v => !v.status);
        console.log(`Found ${vendorsToFix.length} vendors missing status.`);

        for (const v of vendorsToFix) {
            const { error } = await supabase.from('vendors').update({ status: 'Active' }).eq('id', v.id);
            if (error) console.error(`Failed to update vendor ${v.id}:`, error);
            else console.log(`Updated vendor ${v.id} to Active.`);
        }
    }

    // 2. Seed Events if empty
    console.log("Checking Events...");
    const { count: eventCount, error: eError } = await supabase.from('events').select('*', { count: 'exact', head: true });

    if (eError) {
        console.error("Error checking events:", eError);
    } else if (eventCount === 0) {
        console.log("No events found. Seeding sample events...");

        const today = new Date();
        const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
        const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7);

        const sampleEvents = [
            {
                title: 'Weekly Team Sync',
                type: 'Schedule',
                date: today.toISOString().split('T')[0],
                time: '10:00',
                notes: 'Discuss weekly goals and blockers.',
                images: [] // Assuming JSONB or array
            },
            {
                title: 'Vendor Call: Milwaukee',
                type: 'Call',
                date: tomorrow.toISOString().split('T')[0],
                time: '14:00',
                notes: 'Review Q2 catalog updates.',
                images: []
            },
            {
                title: 'Regional Trade Show',
                type: 'Show',
                date: nextWeek.toISOString().split('T')[0],
                time: '09:00',
                notes: 'Booth setup at 8am.',
                images: []
            }
        ];

        const { error: seedError } = await supabase.from('events').insert(sampleEvents);
        if (seedError) console.error("Error seeding events:", seedError);
        else console.log("Seeded 3 sample events.");
    } else {
        console.log(`Events table already has ${eventCount} items. Skipping seed.`);
    }

    console.log("Restoration Complete.");
}

restoreData();
