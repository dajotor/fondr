alter table public.allocation_rules
  add column if not exists is_active boolean not null default true;

alter table public.allocation_rules
  add column if not exists target_percentage numeric(5,2);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.allocation_rules'::regclass
      and conname = 'allocation_rules_target_percentage_check'
  ) then
    alter table public.allocation_rules
      add constraint allocation_rules_target_percentage_check
      check (
        target_percentage is null or
        (target_percentage > 0 and target_percentage <= 100)
      );
  end if;
end;
$$;
