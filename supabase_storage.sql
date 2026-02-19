-- Enable Storage
-- 1. Create PUBLIC Bucket
insert into storage.buckets (id, name, public)
values ('team-files', 'team-files', true) on conflict (id) do
update
set public = true;
-- 2. RLS Policies
-- Policy: Authenticated users can upload files
create policy "Authenticated users can upload files" on storage.objects for
insert to authenticated with check (bucket_id = 'team-files');
-- Policy: Public/Authenticated users can view files (since bucket is public)
create policy "Anyone can view files" on storage.objects for
select to public using (bucket_id = 'team-files');
-- Policy: Users can delete their own files
create policy "Users can delete own files" on storage.objects for delete to authenticated using (
    bucket_id = 'team-files'
    and owner = auth.uid()
);