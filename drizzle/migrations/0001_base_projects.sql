-- Projetos base exibidos no site, com link de demonstração, e histórico das alterações.
create table public.base_projects (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(btrim(title)) between 1 and 80),
  description text not null check (char_length(btrim(description)) between 1 and 300),
  demo_url text not null check (char_length(demo_url) <= 500 and demo_url ~ '^https://[^[:space:]]+$'),
  is_published boolean not null default false,
  sort_order integer not null default 0 check (sort_order between 0 and 9999),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
grant select on public.base_projects to anon, authenticated;
grant insert, update, delete on public.base_projects to authenticated;
grant all on public.base_projects to service_role;
alter table public.base_projects enable row level security;
create policy "public reads published" on public.base_projects for select to anon, authenticated using (is_published);
create policy "admins read all" on public.base_projects for select to authenticated using (public.has_role(auth.uid(), 'admin'));
create policy "admins insert" on public.base_projects for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admins update" on public.base_projects for update to authenticated using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));
create policy "admins delete" on public.base_projects for delete to authenticated using (public.has_role(auth.uid(), 'admin'));

create table public.admin_audit_log (
  id bigint generated always as identity primary key,
  at timestamptz not null default now(),
  actor uuid,
  entity text not null,
  entity_id uuid not null,
  action text not null check (action in ('INSERT','UPDATE','DELETE')),
  before jsonb,
  after jsonb
);
grant select on public.admin_audit_log to authenticated;
grant all on public.admin_audit_log to service_role;
alter table public.admin_audit_log enable row level security;
create policy "admins read audit" on public.admin_audit_log for select to authenticated using (public.has_role(auth.uid(), 'admin'));

create function public.base_projects_touch() returns trigger language plpgsql set search_path = ''
as $$ begin new.updated_at := now(); return new; end $$;
create trigger base_projects_touch before update on public.base_projects
  for each row execute function public.base_projects_touch();

-- Roda com os direitos do dono porque ninguém mais pode gravar no histórico.
create function public.base_projects_audit() returns trigger language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.admin_audit_log (actor, entity, entity_id, action, before, after)
  values (
    auth.uid(), 'base_projects', coalesce(new.id, old.id), tg_op,
    case when tg_op <> 'INSERT' then to_jsonb(old) end,
    case when tg_op <> 'DELETE' then to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;
revoke all on function public.base_projects_audit() from public;
create trigger base_projects_audit after insert or update or delete on public.base_projects
  for each row execute function public.base_projects_audit();
