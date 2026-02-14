-- 1. Add email column to profiles to display in Admin List
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text;
-- 2. Create a function to sync email from auth.users to public.profiles
CREATE OR REPLACE FUNCTION public.sync_user_email() RETURNS TRIGGER AS $$ BEGIN
UPDATE public.profiles
SET email = NEW.email
WHERE id = NEW.id;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 3. Trigger to sync email on auth.users update
DROP TRIGGER IF EXISTS on_auth_user_email_update ON auth.users;
CREATE TRIGGER on_auth_user_email_update
AFTER
UPDATE OF email ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.sync_user_email();
-- 4. Update handle_new_user to include email
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profiles (id, full_name, avatar_url, email)
VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.email
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- 5. Backfill emails (Safe to run multiple times)
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
    AND p.email IS NULL;
-- 6. Update Policies for Admin Access
-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles." ON public.profiles FOR
SELECT USING (
        (
            SELECT role
            FROM public.profiles
            WHERE id = auth.uid()
        ) = 'admin'
    );
-- Admin can update other profiles (e.g., to promote/demote)
CREATE POLICY "Admins can update all profiles." ON public.profiles FOR
UPDATE USING (
        (
            SELECT role
            FROM public.profiles
            WHERE id = auth.uid()
        ) = 'admin'
    );