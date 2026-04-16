create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.portfolios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'Mein Portfolio',
  base_currency text not null default 'EUR',
  is_primary boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolios_base_currency_check check (base_currency = 'EUR')
);

create table if not exists public.etfs (
  id uuid primary key default gen_random_uuid(),
  isin text not null unique,
  name text not null,
  ticker text,
  ter_bps integer,
  last_known_price numeric(18,6),
  price_currency text not null default 'EUR',
  data_source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint etfs_price_currency_check check (price_currency = 'EUR'),
  constraint etfs_data_source_check check (data_source in ('manual', 'mock', 'provider'))
);

create table if not exists public.portfolio_holdings (
  id uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  etf_id uuid not null references public.etfs(id),
  isin_snapshot text not null,
  name_snapshot text not null,
  quantity numeric(18,6) not null,
  cost_basis_per_share numeric(18,6),
  unit_price_manual numeric(18,6),
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint portfolio_holdings_quantity_check check (quantity > 0),
  constraint portfolio_holdings_cost_basis_per_share_check check (
    cost_basis_per_share is null or cost_basis_per_share > 0
  ),
  constraint portfolio_holdings_unit_price_manual_check check (
    unit_price_manual is null or unit_price_manual > 0
  ),
  constraint portfolio_holdings_unique_portfolio_etf unique (portfolio_id, etf_id)
);

alter table public.portfolio_holdings
  add column if not exists portfolio_id uuid;

alter table public.portfolio_holdings
  add column if not exists cost_basis_per_share numeric(18,6);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.portfolio_holdings'::regclass
      and conname = 'portfolio_holdings_cost_basis_per_share_check'
  ) then
    alter table public.portfolio_holdings
      add constraint portfolio_holdings_cost_basis_per_share_check
      check (cost_basis_per_share is null or cost_basis_per_share > 0);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.portfolio_holdings'::regclass
      and conname = 'portfolio_holdings_portfolio_id_fkey'
  ) then
    alter table public.portfolio_holdings
      add constraint portfolio_holdings_portfolio_id_fkey
      foreign key (portfolio_id)
      references public.portfolios(id)
      on delete cascade;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.portfolio_holdings'::regclass
      and conname = 'portfolio_holdings_unique_portfolio_etf'
  ) then
    alter table public.portfolio_holdings
      add constraint portfolio_holdings_unique_portfolio_etf
      unique (portfolio_id, etf_id);
  end if;
end;
$$;

create or replace function public.upsert_etf_from_app(
  p_isin text,
  p_name text,
  p_ticker text default null,
  p_ter_bps integer default null,
  p_last_known_price numeric default null,
  p_price_currency text default 'EUR',
  p_data_source text default 'manual'
)
returns public.etfs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_etf public.etfs;
begin
  insert into public.etfs (
    isin,
    name,
    ticker,
    ter_bps,
    last_known_price,
    price_currency,
    data_source
  )
  values (
    upper(trim(p_isin)),
    trim(p_name),
    nullif(trim(p_ticker), ''),
    p_ter_bps,
    p_last_known_price,
    p_price_currency,
    p_data_source
  )
  on conflict (isin) do update
  set
    name = excluded.name,
    ticker = coalesce(excluded.ticker, public.etfs.ticker),
    ter_bps = coalesce(excluded.ter_bps, public.etfs.ter_bps),
    last_known_price = coalesce(excluded.last_known_price, public.etfs.last_known_price),
    price_currency = excluded.price_currency,
    data_source = excluded.data_source
  returning * into v_etf;

  return v_etf;
end;
$$;

create unique index if not exists portfolios_one_primary_per_user_idx
  on public.portfolios (user_id)
  where is_primary = true;

create index if not exists portfolios_user_id_idx
  on public.portfolios (user_id);

create index if not exists portfolio_holdings_portfolio_id_idx
  on public.portfolio_holdings (portfolio_id);

create index if not exists portfolio_holdings_etf_id_idx
  on public.portfolio_holdings (etf_id);

create index if not exists etfs_isin_idx
  on public.etfs (isin);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_portfolios_updated_at on public.portfolios;
create trigger set_portfolios_updated_at
  before update on public.portfolios
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_etfs_updated_at on public.etfs;
create trigger set_etfs_updated_at
  before update on public.etfs
  for each row execute procedure public.set_updated_at();

drop trigger if exists set_portfolio_holdings_updated_at on public.portfolio_holdings;
create trigger set_portfolio_holdings_updated_at
  before update on public.portfolio_holdings
  for each row execute procedure public.set_updated_at();
