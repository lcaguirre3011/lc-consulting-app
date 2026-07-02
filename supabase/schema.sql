create extension if not exists "pgcrypto";

create type public.app_role as enum ('admin', 'consultant', 'viewer');
create type public.health_status as enum ('verde', 'amarillo', 'rojo');
create type public.priority_level as enum ('baja', 'media', 'alta', 'critica');
create type public.lead_stage as enum ('nuevo lead', 'contacto inicial', 'diagnostico agendado', 'propuesta enviada', 'negociacion', 'cliente ganado', 'perdido');
create type public.project_status as enum ('planeado', 'en progreso', 'pausado', 'en revision', 'completado', 'cancelado');
create type public.task_status as enum ('pendiente', 'en proceso', 'bloqueada', 'en revision', 'terminada');
create type public.kpi_status as enum ('bien', 'alerta', 'critico');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  full_name text not null,
  email text not null,
  role public.app_role not null default 'consultant',
  created_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'consultant',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  industry text,
  size text,
  health public.health_status not null default 'amarillo',
  account_owner uuid references public.users(id),
  main_pain text,
  services text[] not null default '{}',
  revenue_estimate numeric not null default 0,
  since date not null default current_date,
  created_at timestamptz not null default now()
);

create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  created_at timestamptz not null default now()
);

create table public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name public.lead_stage not null,
  position int not null,
  unique (organization_id, name)
);

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  company text not null,
  contact_name text,
  email text,
  phone text,
  stage public.lead_stage not null default 'nuevo lead',
  estimated_value numeric not null default 0,
  close_probability int not null default 0 check (close_probability between 0 and 100),
  next_step text,
  source text,
  last_interaction date,
  created_at timestamptz not null default now()
);

create table public.interactions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete cascade,
  type text not null check (type in ('nota', 'llamada', 'reunion', 'archivo')),
  title text not null,
  detail text,
  happened_at date not null default current_date,
  created_by uuid references public.users(id)
);

create table public.intake_forms (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  payload jsonb not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.diagnoses (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  intake_id uuid references public.intake_forms(id) on delete set null,
  company text not null,
  summary text not null,
  detected_problems text[] not null default '{}',
  opportunities text[] not null default '{}',
  suggested_kpis text[] not null default '{}',
  possible_projects text[] not null default '{}',
  intervention_priority public.priority_level not null default 'media',
  created_at timestamptz not null default now()
);

create table public.consulting_recipes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  problem text not null,
  symptoms text[] not null default '{}',
  steps text[] not null default '{}',
  recommended_kpis text[] not null default '{}',
  deliverables text[] not null default '{}',
  duration_weeks int not null default 1,
  difficulty text not null check (difficulty in ('baja', 'media', 'alta')),
  suggested_tasks text[] not null default '{}',
  templates text[] not null default '{}'
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  name text not null,
  objective text,
  scope text,
  owner uuid references public.users(id),
  starts_at date,
  ends_at date,
  status public.project_status not null default 'planeado',
  priority public.priority_level not null default 'media',
  budget numeric not null default 0,
  progress int not null default 0 check (progress between 0 and 100),
  risks text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.project_phases (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  starts_at date,
  ends_at date,
  progress int not null default 0 check (progress between 0 and 100)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  owner uuid references public.users(id),
  due_date date,
  priority public.priority_level not null default 'media',
  status public.task_status not null default 'pendiente',
  checklist jsonb not null default '[]',
  relation text,
  created_at timestamptz not null default now()
);

create table public.task_comments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  author uuid references public.users(id),
  body text not null,
  created_at timestamptz not null default now()
);

create table public.kpis (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  name text not null,
  description text,
  formula text,
  current_value numeric not null default 0,
  target numeric not null default 0,
  unit text,
  frequency text,
  owner uuid references public.users(id),
  source text,
  status public.kpi_status not null default 'bien'
);

create table public.kpi_measurements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  kpi_id uuid not null references public.kpis(id) on delete cascade,
  measured_at date not null default current_date,
  value numeric not null
);

create table public.meetings (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  meeting_date date not null,
  minutes text,
  agreements text[] not null default '{}',
  owners text[] not null default '{}',
  next_meeting date,
  decisions text[] not null default '{}',
  risks text[] not null default '{}'
);

create table public.meeting_notes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  meeting_id uuid not null references public.meetings(id) on delete cascade,
  body text not null,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.deliverables (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  name text not null,
  description text,
  due_date date,
  status text not null default 'pendiente' check (status in ('pendiente', 'en revision', 'aprobado', 'rechazado')),
  owner uuid references public.users(id),
  file_link text,
  comments text,
  approved_by_client boolean not null default false
);

create table public.files (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  deliverable_id uuid references public.deliverables(id) on delete cascade,
  name text not null,
  storage_path text not null,
  mime_type text,
  uploaded_by uuid references public.users(id),
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid references public.clients(id) on delete set null,
  project_id uuid references public.projects(id) on delete set null,
  type text not null,
  title text not null,
  period text,
  status text not null default 'borrador' check (status in ('listo', 'borrador')),
  summary text,
  payload jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index on public.clients (organization_id);
create index on public.leads (organization_id, stage);
create index on public.projects (organization_id, client_id);
create index on public.tasks (organization_id, status, due_date);
create index on public.kpis (organization_id, client_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;

alter table public.organizations enable row level security;
alter table public.users enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.contacts enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.leads enable row level security;
alter table public.interactions enable row level security;
alter table public.intake_forms enable row level security;
alter table public.diagnoses enable row level security;
alter table public.consulting_recipes enable row level security;
alter table public.projects enable row level security;
alter table public.project_phases enable row level security;
alter table public.tasks enable row level security;
alter table public.task_comments enable row level security;
alter table public.kpis enable row level security;
alter table public.kpi_measurements enable row level security;
alter table public.meetings enable row level security;
alter table public.meeting_notes enable row level security;
alter table public.deliverables enable row level security;
alter table public.files enable row level security;
alter table public.reports enable row level security;

create policy "members read organizations" on public.organizations
for select to authenticated
using (id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "users read same organization" on public.users
for select to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "users update own profile" on public.users
for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

create policy "members read own membership" on public.organization_members
for select to authenticated
using (user_id = (select auth.uid()));

create policy "members manage organization data" on public.clients
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage contacts" on public.contacts
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage stages" on public.pipeline_stages
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage leads" on public.leads
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage interactions" on public.interactions
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage intakes" on public.intake_forms
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage diagnoses" on public.diagnoses
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage recipes" on public.consulting_recipes
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage projects" on public.projects
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage phases" on public.project_phases
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage tasks" on public.tasks
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage task comments" on public.task_comments
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage kpis" on public.kpis
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage kpi measurements" on public.kpi_measurements
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage meetings" on public.meetings
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage meeting notes" on public.meeting_notes
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage deliverables" on public.deliverables
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage files" on public.files
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));

create policy "members manage reports" on public.reports
for all to authenticated
using (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())))
with check (organization_id in (select organization_id from public.organization_members where user_id = (select auth.uid())));
