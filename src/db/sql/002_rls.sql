alter table public.profiles enable row level security;
alter table public.portfolios enable row level security;
alter table public.etfs enable row level security;
alter table public.portfolio_holdings enable row level security;

grant execute on function public.upsert_etf_from_app(text, text, text, integer, numeric, text, text) to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "portfolios_select_own" on public.portfolios;
create policy "portfolios_select_own"
  on public.portfolios
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "portfolios_insert_own" on public.portfolios;
create policy "portfolios_insert_own"
  on public.portfolios
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "portfolios_update_own" on public.portfolios;
create policy "portfolios_update_own"
  on public.portfolios
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "portfolios_delete_own" on public.portfolios;
create policy "portfolios_delete_own"
  on public.portfolios
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "etfs_select_authenticated" on public.etfs;
create policy "etfs_select_authenticated"
  on public.etfs
  for select
  to authenticated
  using (true);

drop policy if exists "portfolio_holdings_select_own" on public.portfolio_holdings;
create policy "portfolio_holdings_select_own"
  on public.portfolio_holdings
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.portfolios
      where public.portfolios.id = portfolio_holdings.portfolio_id
        and public.portfolios.user_id = (select auth.uid())
    )
  );

drop policy if exists "portfolio_holdings_insert_own" on public.portfolio_holdings;
create policy "portfolio_holdings_insert_own"
  on public.portfolio_holdings
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.portfolios
      where public.portfolios.id = portfolio_holdings.portfolio_id
        and public.portfolios.user_id = (select auth.uid())
    )
  );

drop policy if exists "portfolio_holdings_update_own" on public.portfolio_holdings;
create policy "portfolio_holdings_update_own"
  on public.portfolio_holdings
  for update
  to authenticated
  using (
    exists (
      select 1
      from public.portfolios
      where public.portfolios.id = portfolio_holdings.portfolio_id
        and public.portfolios.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.portfolios
      where public.portfolios.id = portfolio_holdings.portfolio_id
        and public.portfolios.user_id = (select auth.uid())
    )
  );

drop policy if exists "portfolio_holdings_delete_own" on public.portfolio_holdings;
create policy "portfolio_holdings_delete_own"
  on public.portfolio_holdings
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.portfolios
      where public.portfolios.id = portfolio_holdings.portfolio_id
        and public.portfolios.user_id = (select auth.uid())
    )
  );
