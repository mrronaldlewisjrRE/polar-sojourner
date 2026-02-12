alter table public.profiles
add column if not exists bio text,
    add column if not exists contact_info text,
    add column if not exists is_online boolean default true;