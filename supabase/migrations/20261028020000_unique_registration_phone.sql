alter table public.camp_registrations add column if not exists phone_normalized text;

update public.camp_registrations
set phone_normalized = right(regexp_replace(phone, '[^0-9]', '', 'g'), 13)
where phone_normalized is null;

alter table public.camp_registrations alter column phone_normalized set not null;
create index if not exists camp_registrations_phone_normalized_idx on public.camp_registrations(phone_normalized);

create or replace function public.prevent_duplicate_registration_phone()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if exists (
    select 1 from public.camp_registrations
    where phone_normalized = new.phone_normalized
      and id <> coalesce(new.id, -1)
  ) then
    raise exception 'registration_phone_exists' using errcode = '23505';
  end if;
  return new;
end;
$$;

drop trigger if exists camp_registrations_unique_phone on public.camp_registrations;
create trigger camp_registrations_unique_phone
before insert or update of phone, phone_normalized on public.camp_registrations
for each row execute function public.prevent_duplicate_registration_phone();
