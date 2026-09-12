-- Milk Tracker v2: shared household schema.
--
-- Security model: this is a two-person household app with no per-user auth.
-- Access is gated only by an app-level passcode checked client-side, plus the
-- fact that the Supabase project URL and anon key aren't published anywhere.
-- Anyone who obtains those two values (e.g. by reading the client bundle) can
-- call the API directly and bypass the passcode -- there is no server-side
-- enforcement of it. The RLS policies below intentionally grant the anon role
-- full read/write access; treat the anon key as a shared household secret,
-- not as a real security boundary.

create table if not exists milk_entries (
  id uuid primary key default gen_random_uuid(),
  date_pumped date not null,
  ounces numeric(5, 2) not null check (ounces > 0),
  status text not null default 'stored' check (status in ('stored', 'used')),
  used_at timestamptz,
  created_by text not null,
  created_at timestamptz not null default now(),
  -- Set once a 6-month-approaching push has been sent for this entry, so the
  -- daily cron doesn't re-notify for the same entry every day of its 2-week window.
  notified_at timestamptz
);

create index if not exists milk_entries_status_idx on milk_entries (status);
create index if not exists milk_entries_date_pumped_idx on milk_entries (date_pumped);

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  created_by text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

-- Required for the app's realtime sync (postgres_changes) between both phones.
alter publication supabase_realtime add table milk_entries;

alter table milk_entries enable row level security;
alter table push_subscriptions enable row level security;

create policy "anon full access to milk_entries" on milk_entries
  for all
  to anon
  using (true)
  with check (true);

create policy "anon full access to push_subscriptions" on push_subscriptions
  for all
  to anon
  using (true)
  with check (true);
