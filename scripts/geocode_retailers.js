import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

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

async function geocodeRetailers() {
    console.log("🌍 Starting Geocoding Service (Nominatim)...");

    // 1. Fetch Retailers missing coordinates
    const { data: retailers, error } = await supabase
        .from('retailers')
        .select('id, name, address, city, state, zip')
        .is('lat', null)
        .limit(20); // Process in batches of 20 to be safe

    if (error) {
        console.error("❌ Error fetching retailers:", error.message);
        return;
    }

    if (retailers.length === 0) {
        console.log("✅ No retailers found needing geocoding.");
        return;
    }

    console.log(`📍 Found ${retailers.length} retailers to geocode.`);

    // 2. Iterate and Geocode
    for (const retailer of retailers) {
        // Construct query: "123 Main St, City, State Zip"
        const query = `${retailer.address}, ${retailer.city}, ${retailer.state} ${retailer.zip}`;
        console.log(`\n🔍 Searching: ${retailer.name} (${query})`);

        try {
            // Fetch from OpenStreetMap (Nominatim)
            // Requirements: User-Agent header, 1 request per second max
            const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`;

            const response = await fetch(url, {
                headers: { 'User-Agent': 'PolarSojourner_GapHunter/1.0' }
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const results = await response.json();

            if (results && results.length > 0) {
                const { lat, lon } = results[0];
                console.log(`   🎯 Found: ${lat}, ${lon}`);

                // Update Supabase
                const { error: updateError } = await supabase
                    .from('retailers')
                    .update({
                        lat: parseFloat(lat),
                        lng: parseFloat(lon),
                        geocoded_at: new Date().toISOString()
                    })
                    .eq('id', retailer.id);

                if (updateError) {
                    console.error(`   ⚠️ DB Update Failed: ${updateError.message}`);
                } else {
                    console.log(`   💾 Saved to Database`);
                }

            } else {
                console.log("   ⚠️ No results found for this address.");
                // Optional: Mark as 'skipped' or 'failed' to avoid re-fetching loop? 
                // For now, next batch will pick it up again unless we flag it. 
                // Let's leave it simple; if it fails, it stays null (retries next run).
            }

        } catch (err) {
            console.error(`   ❌ Geocoding Error: ${err.message}`);
        }

        // 3. Rate Limiting (Crucial for OSM)
        await new Promise(r => setTimeout(r, 1500));
    }

    console.log("\n✅ Batch Complete.");
}

geocodeRetailers();
