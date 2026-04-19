create or replace function public.cleanup_portfolio_holding_dependents()
returns trigger
language plpgsql
as $$
declare
  v_user_id uuid;
begin
  select portfolios.user_id
    into v_user_id
  from public.portfolios
  where portfolios.id = old.portfolio_id;

  if v_user_id is null then
    return old;
  end if;

  if exists (
    select 1
    from public.portfolio_holdings holdings
    inner join public.portfolios portfolios
      on portfolios.id = holdings.portfolio_id
    where portfolios.user_id = v_user_id
      and holdings.etf_id = old.etf_id
  ) then
    return old;
  end if;

  delete from public.allocation_rules
  where user_id = v_user_id
    and etf_id = old.etf_id;

  delete from public.manual_allocation_overrides
  where user_id = v_user_id
    and etf_id = old.etf_id;

  return old;
end;
$$;

drop trigger if exists cleanup_portfolio_holding_dependents_trigger
  on public.portfolio_holdings;

create trigger cleanup_portfolio_holding_dependents_trigger
  after delete on public.portfolio_holdings
  for each row execute procedure public.cleanup_portfolio_holding_dependents();
