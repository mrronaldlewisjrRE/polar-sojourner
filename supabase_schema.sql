-- LOW IMPACT: Run this in Supabase SQL Editor
-- 1. Create Profiles Table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade not null primary key,
    updated_at timestamp with time zone,
    full_name text,
    avatar_url text,
    website text,
    role text default 'viewer'
);
-- 2. Enable RLS
alter table public.profiles enable row level security;
-- 3. Policies
create policy "Public profiles are viewable by everyone." on profiles for
select using (true);
create policy "Users can insert their own profile." on profiles for
insert with check (
        (
            select auth.uid()
        ) = id
    );
create policy "Users can update own profile." on profiles for
update using (
        (
            select auth.uid()
        ) = id
    );
-- 4. Auto-create profile on signup
create or replace function public.handle_new_user() returns trigger as $$ begin
insert into public.profiles (id, full_name, avatar_url)
values (
        new.id,
        new.raw_user_meta_data->>'full_name',
        new.raw_user_meta_data->>'avatar_url'
    );
return new;
end;
$$ language plpgsql security definer;
-- Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after
insert on auth.users for each row execute procedure public.handle_new_user();
-- 5. Backfill existing users (Runs safely)
insert into public.profiles (id, full_name)
select id,
    'Team Member'
from auth.users on conflict (id) do nothing;