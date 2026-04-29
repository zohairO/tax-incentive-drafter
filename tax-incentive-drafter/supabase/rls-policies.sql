-- Run this in the Supabase SQL editor after creating the tables.
-- It allows an authenticated Supabase user to create and manage only their
-- own public.users row, integrations, and drafts.

alter table public.users enable row level security;
alter table public.integrations enable row level security;
alter table public.drafts enable row level security;

create unique index if not exists users_auth_user_id_key
  on public.users (auth_user_id)
  where auth_user_id is not null;

create unique index if not exists integrations_user_id_type_key
  on public.integrations (user_id, type);

drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can read own integrations" on public.integrations;
drop policy if exists "Users can insert own integrations" on public.integrations;
drop policy if exists "Users can update own integrations" on public.integrations;
drop policy if exists "Users can read own drafts" on public.drafts;
drop policy if exists "Users can insert own drafts" on public.drafts;
drop policy if exists "Users can update own drafts" on public.drafts;

create policy "Users can insert own profile"
  on public.users
  for insert
  to authenticated
  with check (
    auth_user_id = auth.uid()
    and lower(email) = lower(auth.jwt() ->> 'email')
  );

create policy "Users can read own profile"
  on public.users
  for select
  to authenticated
  using (
    auth_user_id = auth.uid()
    or lower(email) = lower(auth.jwt() ->> 'email')
  );

create policy "Users can update own profile"
  on public.users
  for update
  to authenticated
  using (
    auth_user_id = auth.uid()
    or lower(email) = lower(auth.jwt() ->> 'email')
  )
  with check (
    auth_user_id = auth.uid()
    and lower(email) = lower(auth.jwt() ->> 'email')
  );

create policy "Users can read own integrations"
  on public.integrations
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.users
      where users.id = integrations.user_id
        and users.auth_user_id = auth.uid()
    )
  );

create policy "Users can insert own integrations"
  on public.integrations
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.users
      where users.id = integrations.user_id
        and users.auth_user_id = auth.uid()
    )
  );

create policy "Users can update own integrations"
  on public.integrations
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.users
      where users.id = integrations.user_id
        and users.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.users
      where users.id = integrations.user_id
        and users.auth_user_id = auth.uid()
    )
  );

create policy "Users can read own drafts"
  on public.drafts
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.users
      where users.id = drafts.user_id
        and users.auth_user_id = auth.uid()
    )
  );

create policy "Users can insert own drafts"
  on public.drafts
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.users
      where users.id = drafts.user_id
        and users.auth_user_id = auth.uid()
    )
  );

create policy "Users can update own drafts"
  on public.drafts
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.users
      where users.id = drafts.user_id
        and users.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.users
      where users.id = drafts.user_id
        and users.auth_user_id = auth.uid()
    )
  );
