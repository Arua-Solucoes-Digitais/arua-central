create type public.app_role as enum ('admin');
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;
create policy "users read own roles" on public.user_roles for select to authenticated using (user_id = auth.uid());

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  email text not null check (char_length(email) between 3 and 255),
  phone text check (phone is null or char_length(phone) <= 30),
  message text not null check (char_length(message) between 1 and 2000),
  consent boolean not null check (consent = true),
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant insert on public.contact_messages to anon, authenticated;
grant select, update, delete on public.contact_messages to authenticated;
grant all on public.contact_messages to service_role;
alter table public.contact_messages enable row level security;
create policy "anyone can send" on public.contact_messages for insert to anon, authenticated with check (read = false);
create policy "admins read" on public.contact_messages for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins update" on public.contact_messages for update to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins delete" on public.contact_messages for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  event_type text not null check (event_type in ('pageview','click')),
  path text not null check (char_length(path) <= 200),
  label text check (label is null or char_length(label) <= 100),
  device text check (device in ('mobile','desktop')),
  created_at timestamptz not null default now()
);
grant insert on public.analytics_events to anon, authenticated;
grant select on public.analytics_events to authenticated;
grant all on public.analytics_events to service_role;
alter table public.analytics_events enable row level security;
create policy "anyone can log" on public.analytics_events for insert to anon, authenticated with check (true);
create policy "admins read events" on public.analytics_events for select to authenticated using (public.has_role(auth.uid(), 'admin'));