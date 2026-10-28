alter table public.carnet_plans add column if not exists phone_normalized text;

update public.carnet_plans
set phone_normalized = right(regexp_replace(phone, '[^0-9]', '', 'g'), 13)
where phone_normalized is null;

alter table public.carnet_plans alter column phone_normalized set not null;
create index if not exists carnet_plans_phone_normalized_idx on public.carnet_plans(phone_normalized);
