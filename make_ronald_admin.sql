-- Update the role for the specific user to 'admin'
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'ronald@cdhassociates.com';
-- Verify the change
SELECT *
FROM public.profiles
WHERE email = 'ronald@cdhassociates.com';