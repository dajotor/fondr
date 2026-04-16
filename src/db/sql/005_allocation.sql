create table if not exists public.allocation_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  etf_id uuid not null references public.etfs(id) on delete cascade,
  sequence_order integer not null,
  contribution_cap numeric(18,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint allocation_rules_sequence_order_check check (sequence_order > 0),
  constraint allocation_rules_contribution_cap_check check (
    contribution_cap is null or contribution_cap > 0
  ),
  constraint allocation_rules_unique_user_etf unique (user_id, etf_id),
  constraint allocation_rules_unique_user_sequence unique (user_id, sequence_order)
);

create table if not exists public.manual_allocation_overrides (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  month date not null,
  etf_id uuid not null references public.etfs(id) on delete cascade,
  percentage numeric(5,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint manual_allocation_overrides_month_check check (
    month = date_trunc('month', month)::date
  ),
  constraint manual_allocation_overrides_percentage_check check (
    percentage > 0 and percentage <= 100
  ),
  constraint manual_allocation_overrides_unique_user_month_etf unique (user_id, month, etf_id)
);

create index if not exists allocation_rules_user_id_idx
  on public.allocation_rules (user_id);

create index if not exists allocation_rules_etf_id_idx
  on public.allocation_rules (etf_id);

create index if not exists manual_allocation_overrides_user_id_idx
  on public.manual_allocation_overrides (user_id);

create index if not exists manual_allocation_overrides_month_idx
  on public.manual_allocation_overrides (month);

drop trigger if exists set_allocation_rules_updated_at on public.allocation_rules;
create trigger set_allocation_rules_updated_at
  before update on public.allocation_rules
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_manual_allocation_overrides_updated_at on public.manual_allocation_overrides;
create trigger set_manual_allocation_overrides_updated_at
  before update on public.manual_allocation_overrides
  for each row execute procedure public.set_updated_at();
