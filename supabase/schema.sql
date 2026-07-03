-- LC Leading Connections OS - Supabase foundation schema
-- Sprint 1 artifact. Review and apply through Supabase migrations when the project is connected.
-- Important for 2026 Supabase defaults: every public table includes explicit GRANTs plus RLS.

create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  name text not null,
  role text not null check (role in ('admin', 'consultor_lc', 'consultor_externo', 'cliente')),
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text not null,
  price numeric(12,2) not null default 0,
  type text not null check (type in ('one_time', 'monthly', 'annual', 'custom')),
  duration text not null,
  deliverables jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  company_name text not null,
  contact_name text not null,
  contact_role text,
  contact_email text,
  contact_phone text,
  industry text,
  city text,
  source text,
  problem_description text,
  affected_area text,
  urgency text,
  budget text,
  decision_maker text,
  desired_outcome text,
  stage text not null default 'nuevo_lead',
  fit_score text,
  estimated_value numeric(12,2) not null default 0,
  probability integer not null default 0 check (probability between 0 and 100),
  assigned_to uuid references public.user_profiles(id),
  next_action text,
  next_action_date date,
  f1_sent boolean not null default false,
  f1_received boolean not null default false,
  research_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  last_activity_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id),
  company_name text not null,
  industry text,
  years_operating integer,
  city text,
  main_contact text,
  contact_email text,
  assigned_consultant uuid references public.user_profiles(id),
  recipe_id uuid,
  health_status text not null default 'amarillo' check (health_status in ('verde', 'amarillo', 'rojo')),
  problem_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.client_contacts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists public.recipes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  area text not null,
  industries jsonb not null default '[]'::jsonb,
  symptoms jsonb not null default '[]'::jsonb,
  root_cause_description text,
  recommended_package_id uuid references public.packages(id),
  typical_duration text,
  confidence_level integer not null default 0,
  times_applied integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'clients_recipe_id_fkey'
  ) then
    alter table public.clients
      add constraint clients_recipe_id_fkey foreign key (recipe_id) references public.recipes(id);
  end if;
end $$;

create table if not exists public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  summary text not null,
  findings jsonb not null default '[]'::jsonb,
  opportunities jsonb not null default '[]'::jsonb,
  suggested_kpis jsonb not null default '[]'::jsonb,
  recommended_package_id uuid references public.packages(id),
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  package_id uuid references public.packages(id),
  name text not null,
  lead_phase text not null default 'L' check (lead_phase in ('L', 'E', 'A', 'D')),
  hypothesis text,
  root_cause text,
  status text not null default 'planned',
  start_date date,
  end_date date,
  progress integer not null default 0 check (progress between 0 and 100),
  assigned_consultant uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'pendiente',
  priority text not null default 'media',
  assigned_to uuid references public.user_profiles(id),
  due_date date,
  lead_phase text check (lead_phase in ('L', 'E', 'A', 'D')),
  checklist jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  session_date timestamptz not null default now(),
  duration_minutes integer,
  mode text check (mode in ('presencial', 'videollamada', 'telefono')),
  attendees jsonb not null default '[]'::jsonb,
  agenda text,
  notes text,
  findings text,
  agreements jsonb not null default '[]'::jsonb,
  next_steps jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  is_prospect_session boolean not null default false,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.forms (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  type text not null check (type in ('f1_filtro', 'f2_descubrimiento')),
  data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.kpis (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  description text,
  baseline_value numeric,
  baseline_date date,
  current_value numeric,
  target_value numeric,
  unit text,
  status text not null default 'alerta',
  measurement_frequency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.kpi_records (
  id uuid primary key default gen_random_uuid(),
  kpi_id uuid not null references public.kpis(id) on delete cascade,
  value numeric not null,
  recorded_at timestamptz not null default now(),
  notes text
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  package_id uuid references public.packages(id),
  amount numeric(12,2) not null default 0,
  payment_scheme text,
  valid_until date,
  status text not null default 'draft',
  pdf_url text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  quote_id uuid references public.quotes(id),
  project_id uuid references public.projects(id),
  client_id uuid not null references public.clients(id) on delete cascade,
  amount numeric(12,2) not null,
  payment_date date not null,
  payment_method text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  category text,
  description text not null,
  amount numeric(12,2) not null,
  expense_date date not null,
  receipt_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.clarity_agreements (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  content text not null,
  status text not null default 'pending',
  signed_at timestamptz,
  pdf_url text,
  version integer not null default 1,
  created_at timestamptz not null default now()
);

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  type text,
  storage_path text,
  created_by uuid references public.user_profiles(id),
  created_at timestamptz not null default now()
);

create table if not exists public.activity_timeline (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  actor_id uuid references public.user_profiles(id),
  event_type text not null,
  title text not null,
  detail text,
  created_at timestamptz not null default now()
);

-- Explicit grants for Supabase Data API visibility.
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- RLS foundation.
alter table public.organizations enable row level security;
alter table public.user_profiles enable row level security;
alter table public.packages enable row level security;
alter table public.leads enable row level security;
alter table public.clients enable row level security;
alter table public.client_contacts enable row level security;
alter table public.recipes enable row level security;
alter table public.diagnoses enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.sessions enable row level security;
alter table public.forms enable row level security;
alter table public.kpis enable row level security;
alter table public.kpi_records enable row level security;
alter table public.quotes enable row level security;
alter table public.payments enable row level security;
alter table public.expenses enable row level security;
alter table public.clarity_agreements enable row level security;
alter table public.documents enable row level security;
alter table public.activity_timeline enable row level security;

create or replace function public.current_org_id()
returns uuid
language sql
stable
security invoker
as $$
  select org_id from public.user_profiles where id = (select auth.uid())
$$;

-- Organization-scoped policy template applied to core org tables.
create policy "org members can read their organization"
on public.organizations for select
to authenticated
using (id = public.current_org_id());

create policy "users can read profiles in their org"
on public.user_profiles for select
to authenticated
using (org_id = public.current_org_id());

create policy "org members can manage packages"
on public.packages for all
to authenticated
using (org_id = public.current_org_id())
with check (org_id = public.current_org_id());

-- Repeatable org-scoped access for operational tables.
create policy "org access leads" on public.leads for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access clients" on public.clients for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access contacts" on public.client_contacts for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access recipes" on public.recipes for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access diagnoses" on public.diagnoses for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access projects" on public.projects for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access tasks" on public.tasks for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access sessions" on public.sessions for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access forms" on public.forms for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access kpis" on public.kpis for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access quotes" on public.quotes for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access payments" on public.payments for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access expenses" on public.expenses for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access agreements" on public.clarity_agreements for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access documents" on public.documents for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());
create policy "org access timeline" on public.activity_timeline for all to authenticated using (org_id = public.current_org_id()) with check (org_id = public.current_org_id());

create policy "org access kpi records through kpi"
on public.kpi_records for all
to authenticated
using (exists (select 1 from public.kpis where kpis.id = kpi_records.kpi_id and kpis.org_id = public.current_org_id()))
with check (exists (select 1 from public.kpis where kpis.id = kpi_records.kpi_id and kpis.org_id = public.current_org_id()));
