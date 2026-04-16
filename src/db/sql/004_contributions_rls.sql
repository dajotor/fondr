alter table public.contribution_rules enable row level security;
alter table public.lump_sum_contributions enable row level security;

drop policy if exists "contribution_rules_select_own" on public.contribution_rules;
create policy "contribution_rules_select_own"
  on public.contribution_rules
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "contribution_rules_insert_own" on public.contribution_rules;
create policy "contribution_rules_insert_own"
  on public.contribution_rules
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "contribution_rules_update_own" on public.contribution_rules;
create policy "contribution_rules_update_own"
  on public.contribution_rules
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "contribution_rules_delete_own" on public.contribution_rules;
create policy "contribution_rules_delete_own"
  on public.contribution_rules
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "lump_sum_contributions_select_own" on public.lump_sum_contributions;
create policy "lump_sum_contributions_select_own"
  on public.lump_sum_contributions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "lump_sum_contributions_insert_own" on public.lump_sum_contributions;
create policy "lump_sum_contributions_insert_own"
  on public.lump_sum_contributions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "lump_sum_contributions_update_own" on public.lump_sum_contributions;
create policy "lump_sum_contributions_update_own"
  on public.lump_sum_contributions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "lump_sum_contributions_delete_own" on public.lump_sum_contributions;
create policy "lump_sum_contributions_delete_own"
  on public.lump_sum_contributions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
