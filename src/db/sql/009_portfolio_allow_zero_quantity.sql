alter table public.portfolio_holdings
  drop constraint if exists portfolio_holdings_quantity_check;

alter table public.portfolio_holdings
  add constraint portfolio_holdings_quantity_check
  check (quantity >= 0);
