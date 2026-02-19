-- 1. Ensure email column exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text;
-- 2. Backfill emails from auth.users (This fixes the missing data)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;
-- 3. Promote Ronald to Admin
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'ronald@cdhassociates.com';
-- 4. Verify the result
SELECT id,
    email,
    role
FROM public.profiles
WHERE email = 'ronald@cdhassociates.com';