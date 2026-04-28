create extension if not exists pgcrypto;

create table if not exists public.nhai_projects (
  id text primary key,
  code text not null,
  name text not null,
  client text not null default 'NHAI',
  type text not null,
  status text not null,
  priority text not null,
  progress integer not null default 0,
  start_date date not null,
  end_date date not null,
  budget numeric not null default 0,
  spent numeric not null default 0,
  description text not null default '',
  location text not null default '',
  manager_id text not null default '',
  team_ids text[] not null default '{}',
  latitude numeric,
  longitude numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.nhai_tasks (
  id text primary key,
  project_id text not null references public.nhai_projects(id) on delete cascade,
  title text not null,
  description text not null default '',
  assignee_id text not null,
  status text not null,
  priority text not null,
  due_date date not null,
  created_at date not null default current_date,
  tags text[] not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists public.nhai_field_updates (
  id uuid primary key default gen_random_uuid(),
  task_id text not null references public.nhai_tasks(id) on delete cascade,
  project_id text not null references public.nhai_projects(id) on delete cascade,
  status text not null,
  work_done text not null default '',
  chainage_covered text not null default '',
  drone_completed boolean not null default false,
  gcp_completed boolean not null default false,
  issue text not null default '',
  next_action text not null default '',
  attachment_name text not null default '',
  saved_offline boolean not null default false,
  updated_at timestamptz not null default now()
);

create index if not exists nhai_tasks_project_id_idx on public.nhai_tasks(project_id);
create index if not exists nhai_tasks_assignee_id_idx on public.nhai_tasks(assignee_id);
create index if not exists nhai_field_updates_task_id_idx on public.nhai_field_updates(task_id);
create index if not exists nhai_field_updates_updated_at_idx on public.nhai_field_updates(updated_at desc);

alter table public.nhai_projects enable row level security;
alter table public.nhai_tasks enable row level security;
alter table public.nhai_field_updates enable row level security;

drop policy if exists "Authenticated users can read NHAI projects" on public.nhai_projects;
drop policy if exists "Authenticated users can read NHAI tasks" on public.nhai_tasks;
drop policy if exists "Authenticated users can read NHAI field updates" on public.nhai_field_updates;

create policy "Authenticated users can read NHAI projects"
on public.nhai_projects for select
to authenticated
using (true);

create policy "Authenticated users can read NHAI tasks"
on public.nhai_tasks for select
to authenticated
using (true);

create policy "Authenticated users can read NHAI field updates"
on public.nhai_field_updates for select
to authenticated
using (true);
