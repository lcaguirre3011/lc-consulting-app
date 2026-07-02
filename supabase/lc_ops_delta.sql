do $$ begin
  create type public.consultant_status as enum ('disponible', 'ocupado', 'pausado');
exception when duplicate_object then null;
end $$;

alter table public.leads
  add column if not exists intake jsonb not null default '{}',
  add column if not exists recommended_package text,
  add column if not exists converted_client_id uuid references public.clients(id) on delete set null;

alter table public.clients
  add column if not exists expediente_ids uuid[] not null default '{}';

alter table public.projects
  add column if not exists package_type text;

alter table public.reports
  add column if not exists generated_at date;

create table if not exists public.client_history (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  actor text,
  title text not null,
  detail text,
  happened_at date not null default current_date
);

create table if not exists public.consultants (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  specialties text[] not null default '{}',
  status public.consultant_status not null default 'disponible',
  capacity int not null default 0 check (capacity between 0 and 100),
  created_at timestamptz not null default now()
);

create table if not exists public.consultant_projects (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  consultant_id uuid not null references public.consultants(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  primary key (consultant_id, project_id)
);

create table if not exists public.consulting_packages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text not null,
  duration text,
  created_at timestamptz not null default now()
);

alter table public.client_history enable row level security;
alter table public.consultants enable row level security;
alter table public.consultant_projects enable row level security;
alter table public.consulting_packages enable row level security;

create policy "members manage client history" on public.client_history
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage consultants" on public.consultants
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage consultant projects" on public.consultant_projects
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage consulting packages" on public.consulting_packages
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));
