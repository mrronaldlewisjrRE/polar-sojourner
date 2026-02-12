import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const team = [
    'ronald@cdhassociates.com'
];

const TEMP_PASSWORD = 'WelcomeCDH2026!';

async function registerTeam() {
    console.log('Starting client-side registration...');

    for (const email of team) {
        // We use signUp, which triggers the confirmation email
        const { data, error } = await supabase.auth.signUp({
            email,
            password: TEMP_PASSWORD,
            options: {
                data: { full_name: email.split('@')[0] } // specific metadata if needed
            }
        });

        if (error) {
            console.error(`❌ Error for ${email}:`, error.message);
        } else {
            if (data.user && !data.session) {
                console.log(`✅ Success for ${email}: Confirmation email sent.`);
            } else if (data.session) {
                console.log(`✅ Success for ${email}: Account created/logged in (Email confirmation disabled?).`);
            } else {
                console.log(`⚠️ Status unclear for ${email}`, data);
            }
        }

        // Wait a bit to avoid rate limits
        await new Promise(r => setTimeout(r, 1000));
    }
}

registerTeam();
