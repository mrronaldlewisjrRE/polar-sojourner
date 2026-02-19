import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('🔍 Verifying File Sharing Schema...');

    // 1. Check Messages Table Columns
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('attachment_url, attachment_type')
            .limit(1);

        if (error) {
            console.error('❌ Check Failed: `attachment_url` column missing in `messages`.');
            console.error('   Error:', error.message);
        } else {
            console.log('✅ Column `attachment_url` exists.');
        }
    } catch (e) {
        console.error('❌ Exception checking columns:', e);
    }

    // 2. Check Storage Bucket
    try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

        if (bucketError) {
            console.error('❌ Failed to list buckets:', bucketError.message);
        } else {
            const teamFiles = buckets.find(b => b.name === 'team-files');
            if (teamFiles) {
                console.log('✅ Bucket `team-files` exists.');
                if (teamFiles.public) {
                    console.log('✅ Bucket is PUBLIC.');
                } else {
                    console.warn('⚠️ Bucket exists but is NOT PUBLIC.');
                }
            } else {
                console.error('❌ Bucket `team-files` NOT found.');
            }
        }
    } catch (e) {
        console.error('❌ Exception checking storage:', e);
    }
}

verify();
