create table if not exists public.goal_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  target_wealth numeric(18,2) not null,
  target_year integer not null,
  required_probability numeric(6,5) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint goal_settings_target_wealth_check check (target_wealth > 0),
  constraint goal_settings_target_year_check check (
    target_year >= extract(year from now())::integer
  ),
  constraint goal_settings_required_probability_check check (
    required_probability > 0 and required_probability <= 1
  ),
  constraint goal_settings_unique_user unique (user_id)
);

create index if not exists goal_settings_user_id_idx
  on public.goal_settings (user_id);

drop trigger if exists set_goal_settings_updated_at on public.goal_settings;
create trigger set_goal_settings_updated_at
  before update on public.goal_settings
  for each row execute procedure public.set_updated_at();
