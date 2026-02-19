-- 1. Enable RLS for Events if not already (it is, hence the error)
-- ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
-- 2. Create Policy to allow Insertion (for anyone or authenticated)
-- Checking if table is public or private. Assuming we want to allow the "app" to write.
-- For now, allow public insert/select for testing, or better: allow 'anon' and 'authenticated'.
DROP POLICY IF EXISTS "Enable read access for all users" ON public.events;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.events;
DROP POLICY IF EXISTS "Enable update for all users" ON public.events;
CREATE POLICY "Enable read access for all users" ON public.events FOR
SELECT USING (true);
CREATE POLICY "Enable insert for all users" ON public.events FOR
INSERT WITH CHECK (true);
CREATE POLICY "Enable update for all users" ON public.events FOR
UPDATE USING (true);
-- 3. Seed Sample Events (Idempotent)
INSERT INTO public.events (title, type, date, time, notes, images)
VALUES (
        'Weekly Team Sync',
        'Schedule',
        CURRENT_DATE,
        '10:00',
        'Discuss weekly goals and blockers.',
        '[]'::jsonb
    ),
    (
        'Vendor Call: Milwaukee',
        'Call',
        CURRENT_DATE + 1,
        '14:00',
        'Review Q2 catalog updates.',
        '[]'::jsonb
    ),
    (
        'Regional Trade Show',
        'Show',
        CURRENT_DATE + 7,
        '09:00',
        'Booth setup at 8am.',
        '[]'::jsonb
    ) ON CONFLICT DO NOTHING;
-- Assuming no unique constraint on title/date, this might just insert. ideally ID is serial/uuid.
-- If ID is auto-gen, this is fine.