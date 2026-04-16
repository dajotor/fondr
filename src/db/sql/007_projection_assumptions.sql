alter table public.etfs
  add column if not exists expected_return_annual numeric(8,6),
  add column if not exists volatility_annual numeric(8,6);

alter table public.etfs
  drop constraint if exists etfs_expected_return_annual_check;

alter table public.etfs
  add constraint etfs_expected_return_annual_check check (
    expected_return_annual is null
    or (expected_return_annual > -1 and expected_return_annual < 10)
  );

alter table public.etfs
  drop constraint if exists etfs_volatility_annual_check;

alter table public.etfs
  add constraint etfs_volatility_annual_check check (
    volatility_annual is null
    or (volatility_annual >= 0 and volatility_annual < 10)
  );

create or replace function public.update_etf_projection_assumptions_for_app(
  p_etf_id uuid,
  p_expected_return_annual numeric,
  p_ter_bps integer,
  p_volatility_annual numeric default null
)
returns public.etfs
language plpgsql
security definer
set search_path = public
as $$
declare
  v_etf public.etfs;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if not exists (
    select 1
    from public.portfolio_holdings holdings
    inner join public.portfolios portfolios
      on portfolios.id = holdings.portfolio_id
    where holdings.etf_id = p_etf_id
      and portfolios.user_id = auth.uid()
  ) then
    raise exception 'ETF is not part of the current user portfolio';
  end if;

  update public.etfs
  set
    expected_return_annual = p_expected_return_annual,
    ter_bps = p_ter_bps,
    volatility_annual = p_volatility_annual
  where id = p_etf_id
  returning * into v_etf;

  if v_etf.id is null then
    raise exception 'ETF not found';
  end if;

  return v_etf;
end;
$$;
