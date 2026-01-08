-- Base schema for Gestao do Lar (Supabase/Postgres)

create extension if not exists "pgcrypto";

-- Helper function to keep updated_at in sync
create or replace function set_updated_at()
returns trigger as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$ language plpgsql;

-- Profiles
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  avatar_url text,
  criado_em timestamptz not null default now()
);

-- Households (groups)
create table if not exists households (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz not null default now()
);

-- Members
create table if not exists household_members (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  papel text not null default 'membro',
  ativo boolean not null default true,
  criado_em timestamptz not null default now(),
  unique (household_id, user_id)
);

-- Tasks
create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  titulo text not null,
  descricao text,
  responsavel_id uuid references auth.users(id),
  status text not null default 'pendente' check (status in ('pendente', 'ativa', 'concluida')),
  proxima_execucao_em date,
  criado_por uuid not null references auth.users(id),
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

-- Recurrence
create table if not exists task_recurrences (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  tipo text not null check (tipo in ('diaria', 'semanal', 'mensal')),
  intervalo int not null default 1 check (intervalo > 0),
  dias_semana int[] check (
    dias_semana is null
    or array_length(dias_semana, 1) >= 1
  ),
  criado_em timestamptz not null default now()
);

-- Proposals
create table if not exists task_proposals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  tipo text not null check (tipo in ('criacao', 'edicao', 'exclusao')),
  task_id uuid references tasks(id) on delete set null,
  payload jsonb not null,
  status text not null default 'pendente' check (status in ('pendente', 'aprovada', 'rejeitada')),
  criado_por uuid not null references auth.users(id),
  criado_em timestamptz not null default now()
);

-- Approvals
create table if not exists task_approvals (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references task_proposals(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  aprovado boolean not null,
  criado_em timestamptz not null default now(),
  unique (proposal_id, user_id)
);

-- Executions
create table if not exists task_executions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references tasks(id) on delete cascade,
  concluido_por uuid not null references auth.users(id),
  concluido_em timestamptz not null default now()
);

-- Execution photos
create table if not exists task_execution_photos (
  id uuid primary key default gen_random_uuid(),
  execution_id uuid not null references task_executions(id) on delete cascade,
  photo_url text not null,
  criado_em timestamptz not null default now()
);

-- Trigger: tasks.updated_at
drop trigger if exists trg_tasks_updated_at on tasks;
create trigger trg_tasks_updated_at
before update on tasks
for each row execute function set_updated_at();

-- Indexes
create index if not exists idx_household_members_household on household_members(household_id);
create index if not exists idx_household_members_user on household_members(user_id);
create index if not exists idx_tasks_household on tasks(household_id);
create index if not exists idx_tasks_responsavel on tasks(responsavel_id);
create index if not exists idx_task_proposals_household on task_proposals(household_id);
create index if not exists idx_task_approvals_proposal on task_approvals(proposal_id);
create index if not exists idx_task_executions_task on task_executions(task_id);
create index if not exists idx_task_execution_photos_exec on task_execution_photos(execution_id);

-- Row Level Security (RLS)
alter table profiles enable row level security;
alter table households enable row level security;
alter table household_members enable row level security;
alter table tasks enable row level security;
alter table task_recurrences enable row level security;
alter table task_proposals enable row level security;
alter table task_approvals enable row level security;
alter table task_executions enable row level security;
alter table task_execution_photos enable row level security;

-- Profiles: user can read/write own profile
create policy profiles_select_own on profiles
for select using (id = auth.uid());
create policy profiles_upsert_own on profiles
for insert with check (id = auth.uid());
create policy profiles_update_own on profiles
for update using (id = auth.uid());

-- Households: members can read, creator can insert
create policy households_select_member on households
for select using (
  exists (
    select 1 from household_members hm
    where hm.household_id = households.id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
create policy households_insert_self on households
for insert with check (true);

-- Household members: members can read, user can insert self
create policy household_members_select_member on household_members
for select using (
  exists (
    select 1 from household_members hm
    where hm.household_id = household_members.household_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
create policy household_members_insert_self on household_members
for insert with check (user_id = auth.uid());
create policy household_members_update_self on household_members
for update using (user_id = auth.uid());

-- Tasks: members can read/write tasks in their household
create policy tasks_select_member on tasks
for select using (
  exists (
    select 1 from household_members hm
    where hm.household_id = tasks.household_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
create policy tasks_insert_member on tasks
for insert with check (
  exists (
    select 1 from household_members hm
    where hm.household_id = tasks.household_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
create policy tasks_update_member on tasks
for update using (
  exists (
    select 1 from household_members hm
    where hm.household_id = tasks.household_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);

-- Task recurrences: follow task access
create policy task_recurrences_select_member on task_recurrences
for select using (
  exists (
    select 1
    from tasks t
    join household_members hm on hm.household_id = t.household_id
    where t.id = task_recurrences.task_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
create policy task_recurrences_insert_member on task_recurrences
for insert with check (
  exists (
    select 1
    from tasks t
    join household_members hm on hm.household_id = t.household_id
    where t.id = task_recurrences.task_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
create policy task_recurrences_update_member on task_recurrences
for update using (
  exists (
    select 1
    from tasks t
    join household_members hm on hm.household_id = t.household_id
    where t.id = task_recurrences.task_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);

-- Proposals: members can read/insert for their household
create policy task_proposals_select_member on task_proposals
for select using (
  exists (
    select 1 from household_members hm
    where hm.household_id = task_proposals.household_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
create policy task_proposals_insert_member on task_proposals
for insert with check (
  exists (
    select 1 from household_members hm
    where hm.household_id = task_proposals.household_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
create policy task_proposals_update_member on task_proposals
for update using (
  exists (
    select 1 from household_members hm
    where hm.household_id = task_proposals.household_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);

-- Approvals: members can read; user can insert own approval
create policy task_approvals_select_member on task_approvals
for select using (
  exists (
    select 1
    from task_proposals tp
    join household_members hm on hm.household_id = tp.household_id
    where tp.id = task_approvals.proposal_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
create policy task_approvals_insert_self on task_approvals
for insert with check (user_id = auth.uid());
create policy task_approvals_update_self on task_approvals
for update using (user_id = auth.uid());

-- Executions: members can read/write for tasks in their household
create policy task_executions_select_member on task_executions
for select using (
  exists (
    select 1
    from tasks t
    join household_members hm on hm.household_id = t.household_id
    where t.id = task_executions.task_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
create policy task_executions_insert_member on task_executions
for insert with check (
  exists (
    select 1
    from tasks t
    join household_members hm on hm.household_id = t.household_id
    where t.id = task_executions.task_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);

-- Execution photos: follow executions access
create policy task_execution_photos_select_member on task_execution_photos
for select using (
  exists (
    select 1
    from task_executions te
    join tasks t on t.id = te.task_id
    join household_members hm on hm.household_id = t.household_id
    where te.id = task_execution_photos.execution_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
create policy task_execution_photos_insert_member on task_execution_photos
for insert with check (
  exists (
    select 1
    from task_executions te
    join tasks t on t.id = te.task_id
    join household_members hm on hm.household_id = t.household_id
    where te.id = task_execution_photos.execution_id
      and hm.user_id = auth.uid()
      and hm.ativo = true
  )
);
