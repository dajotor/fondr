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
      add constraint portfolio_holdings_cost_basis_per_share_check check (
        cost_basis_per_share is null or cost_basis_per_share > 0
      );
  end if;
end;
$$;
