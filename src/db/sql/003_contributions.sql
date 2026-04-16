create table if not exists public.contribution_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  start_month date not null,
  monthly_amount numeric(18,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint contribution_rules_start_month_check check (
    start_month = date_trunc('month', start_month)::date
  ),
  constraint contribution_rules_monthly_amount_check check (monthly_amount > 0),
  constraint contribution_rules_unique_user_month unique (user_id, start_month)
);

create table if not exists public.lump_sum_contributions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  contribution_month date not null,
  amount numeric(18,2) not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lump_sum_contributions_month_check check (
    contribution_month = date_trunc('month', contribution_month)::date
  ),
  constraint lump_sum_contributions_amount_check check (amount > 0)
);

create index if not exists contribution_rules_user_id_idx
  on public.contribution_rules (user_id);

create index if not exists contribution_rules_start_month_idx
  on public.contribution_rules (start_month);

create index if not exists lump_sum_contributions_user_id_idx
  on public.lump_sum_contributions (user_id);

create index if not exists lump_sum_contributions_month_idx
  on public.lump_sum_contributions (contribution_month);

drop trigger if exists set_contribution_rules_updated_at on public.contribution_rules;
create trigger set_contribution_rules_updated_at
  before update on public.contribution_rules
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_lump_sum_contributions_updated_at on public.lump_sum_contributions;
create trigger set_lump_sum_contributions_updated_at
  before update on public.lump_sum_contributions
  for each row execute procedure public.set_updated_at();
