/* =============================
 SUPABASE MIGRATION
 File: final_admin_migration.sql
 ============================= */
-- 1. Add email column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text;
-- 2. Sync email from auth.users
CREATE OR REPLACE FUNCTION public.sync_profile_email() RETURNS trigger AS $$ BEGIN
UPDATE public.profiles
SET email = NEW.email
WHERE id = NEW.id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
AFTER
UPDATE OF email ON auth.users FOR EACH ROW EXECUTE FUNCTION public.sync_profile_email();
-- 3. Backfill existing users
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id;
-- 4. Ensure role column exists
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS role text DEFAULT 'viewer';
-- 5. RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- Allow users to view own profile
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR
SELECT USING (auth.uid() = id);
-- Admins can view all profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );
-- Admins can update roles
DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles FOR
UPDATE USING (
        EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE id = auth.uid()
                AND role = 'admin'
        )
    );