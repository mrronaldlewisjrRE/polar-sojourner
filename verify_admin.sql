-- Check if the profile row exists
SELECT *
FROM public.profiles
WHERE email = 'ronald@cdhassociates.com';
-- Check if the auth user exists (just ID and email)
SELECT id,
    email
FROM auth.users
WHERE email = 'ronald@cdhassociates.com';
-- Check table definition to ensure 'role' and 'email' columns exist
SELECT column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'profiles';