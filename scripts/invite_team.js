import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
    console.error('Error: Missing VITE_SUPABASE_URL or VITE_SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const teamEmails = [
    'calvin@cdhassociates.com', // Corrected spelling from 'cdhassosciates' based on others
    'david@cdhassociates.com',
    'amy@cdhassociates.com',
    'mitzi@cdhassociates.com',
    'ronald@cdhassociates.com'
];

async function inviteTeam() {
    console.log(`Starting invites for ${teamEmails.length} team members...`);

    for (const email of teamEmails) {
        const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

        if (error) {
            console.error(`❌ Failed to invite ${email}:`, error.message);
        } else {
            console.log(`✅ Invited: ${email}`);
        }
    }
}

inviteTeam();
