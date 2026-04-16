alter table public.goal_settings enable row level security;

drop policy if exists "goal_settings_select_own" on public.goal_settings;
create policy "goal_settings_select_own"
  on public.goal_settings
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "goal_settings_insert_own" on public.goal_settings;
create policy "goal_settings_insert_own"
  on public.goal_settings
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "goal_settings_update_own" on public.goal_settings;
create policy "goal_settings_update_own"
  on public.goal_settings
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "goal_settings_delete_own" on public.goal_settings;
create policy "goal_settings_delete_own"
  on public.goal_settings
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
