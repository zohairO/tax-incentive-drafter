-- Run this in the Supabase SQL editor after creating the tables.
-- It allows an authenticated Supabase user to create and manage only their
-- own public.users row, integrations, and drafts.

alter table public.users enable row level security;
alter table public.integrations enable row level security;
alter table public.drafts enable row level security;

create table if not exists public.evidence_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  draft_id uuid not null references public.drafts(id) on delete cascade,
  source_type text not null,
  source_id text not null,
  source_url text,
  title text not null,
  body text not null default '',
  author text,
  occurred_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  draft_id uuid not null references public.drafts(id) on delete cascade,
  status text not null default 'running',
  evidence_count integer not null default 0,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.evidence_items enable row level security;
alter table public.ingestion_runs enable row level security;

create unique index if not exists users_auth_user_id_key
  on public.users (auth_user_id)
  where auth_user_id is not null;

create unique index if not exists integrations_user_id_type_key
  on public.integrations (user_id, type);

create index if not exists evidence_items_draft_id_idx
  on public.evidence_items (draft_id);

create unique index if not exists evidence_items_draft_source_key
  on public.evidence_items (draft_id, source_type, source_id);

create index if not exists ingestion_runs_draft_id_idx
  on public.ingestion_runs (draft_id);

drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;
drop policy if exists "Users can read own integrations" on public.integrations;
drop policy if exists "Users can insert own integrations" on public.integrations;
drop policy if exists "Users can update own integrations" on public.integrations;
drop policy if exists "Users can read own drafts" on public.drafts;
drop policy if exists "Users can insert own drafts" on public.drafts;
drop policy if exists "Users can update own drafts" on public.drafts;
drop policy if exists "Users can read own evidence items" on public.evidence_items;
drop policy if exists "Users can insert own evidence items" on public.evidence_items;
drop policy if exists "Users can update own evidence items" on public.evidence_items;
drop policy if exists "Users can delete own evidence items" on public.evidence_items;
drop policy if exists "Users can read own ingestion runs" on public.ingestion_runs;
drop policy if exists "Users can insert own ingestion runs" on public.ingestion_runs;
drop policy if exists "Users can update own ingestion runs" on public.ingestion_runs;

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

create policy "Users can read own evidence items"
  on public.evidence_items
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = evidence_items.user_id
        and users.auth_user_id = auth.uid()
    )
  );

create policy "Users can insert own evidence items"
  on public.evidence_items
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where users.id = evidence_items.user_id
        and users.auth_user_id = auth.uid()
    )
  );

create policy "Users can update own evidence items"
  on public.evidence_items
  for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = evidence_items.user_id
        and users.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.users
      where users.id = evidence_items.user_id
        and users.auth_user_id = auth.uid()
    )
  );

create policy "Users can delete own evidence items"
  on public.evidence_items
  for delete
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = evidence_items.user_id
        and users.auth_user_id = auth.uid()
    )
  );

create policy "Users can read own ingestion runs"
  on public.ingestion_runs
  for select
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = ingestion_runs.user_id
        and users.auth_user_id = auth.uid()
    )
  );

create policy "Users can insert own ingestion runs"
  on public.ingestion_runs
  for insert
  to authenticated
  with check (
    exists (
      select 1 from public.users
      where users.id = ingestion_runs.user_id
        and users.auth_user_id = auth.uid()
    )
  );

create policy "Users can update own ingestion runs"
  on public.ingestion_runs
  for update
  to authenticated
  using (
    exists (
      select 1 from public.users
      where users.id = ingestion_runs.user_id
        and users.auth_user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.users
      where users.id = ingestion_runs.user_id
        and users.auth_user_id = auth.uid()
    )
  );
