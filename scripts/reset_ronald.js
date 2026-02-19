/* global process */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!serviceRoleKey) {
    console.error('❌ Error: VITE_SUPABASE_SERVICE_ROLE_KEY is missing in .env');
    console.log('   You need the Service Role Key to delete users.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

const email = 'ronald@cdhassociates.com';

async function resetUser() {
    console.log(`🔍 Looking for user: ${email}`);

    // 1. Find User
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
        console.error('❌ Error listing users:', listError.message);
        return;
    }

    const user = users.find(u => u.email === email);

    if (user) {
        console.log(`✅ Found user ${user.id}. Deleting...`);
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);

        if (deleteError) {
            console.error('❌ Error deleting user:', deleteError.message);
            return;
        }
        console.log('🗑️ User deleted.');
    } else {
        console.log('ℹ️ User not found (might already be deleted).');
    }

    // 2. Re-invite User (Pre-confirmed)
    console.log('✨ Creating new account (auto-confirmed)...');
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'WelcomeCDH2026!',
        email_confirm: true,
        user_metadata: { full_name: 'Ronald Lewis' }
    });

    if (createError) {
        console.error('❌ Error creating user:', createError.message);
    } else {
        console.log(`✅ SUCCESS! User created and confirmed.`);
        console.log(`   Email: ${email}`);
        console.log(`   Password: WelcomeCDH2026!`);
        console.log(`   ID: ${newUser.user.id}`);
    }
}

resetUser();
