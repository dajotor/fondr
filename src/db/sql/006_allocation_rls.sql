alter table public.allocation_rules enable row level security;
alter table public.manual_allocation_overrides enable row level security;

drop policy if exists "allocation_rules_select_own" on public.allocation_rules;
create policy "allocation_rules_select_own"
  on public.allocation_rules
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "allocation_rules_insert_own" on public.allocation_rules;
create policy "allocation_rules_insert_own"
  on public.allocation_rules
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "allocation_rules_update_own" on public.allocation_rules;
create policy "allocation_rules_update_own"
  on public.allocation_rules
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "allocation_rules_delete_own" on public.allocation_rules;
create policy "allocation_rules_delete_own"
  on public.allocation_rules
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "manual_allocation_overrides_select_own" on public.manual_allocation_overrides;
create policy "manual_allocation_overrides_select_own"
  on public.manual_allocation_overrides
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "manual_allocation_overrides_insert_own" on public.manual_allocation_overrides;
create policy "manual_allocation_overrides_insert_own"
  on public.manual_allocation_overrides
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "manual_allocation_overrides_update_own" on public.manual_allocation_overrides;
create policy "manual_allocation_overrides_update_own"
  on public.manual_allocation_overrides
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "manual_allocation_overrides_delete_own" on public.manual_allocation_overrides;
create policy "manual_allocation_overrides_delete_own"
  on public.manual_allocation_overrides
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
