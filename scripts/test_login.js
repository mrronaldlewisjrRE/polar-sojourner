/* global process */
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
    console.log("Attempting login for ronald@cdhassociates.com...");
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'ronald+test@cdhassociates.com',
        password: 'WelcomeCDH2026!'
    });

    if (error) {
        console.error("❌ Login Failed:");
        console.error("   Message:", error.message);
        console.error("   Status:", error.status); // 400 usually
        console.error("   Name:", error.name);
    } else {
        console.log("✅ Login SUCCESS!");
        console.log("   User ID:", data.user.id);
        console.log("   Audience:", data.user.role);
    }
}

testLogin();
