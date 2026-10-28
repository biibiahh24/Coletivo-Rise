create table if not exists public.carnet_plans (
  id uuid primary key default gen_random_uuid(),
  registration_protocol text not null unique references public.camp_registrations(protocol) on delete cascade,
  full_name text not null,
  phone text not null,
  access_token_hash text not null unique,
  total_amount_cents integer not null check (total_amount_cents > 0),
  paid_amount_cents integer not null default 0 check (paid_amount_cents >= 0),
  due_date date not null default date '2027-01-25',
  status text not null default 'pending' check (status in ('pending', 'paid', 'overdue')),
  created_at bigint not null,
  updated_at bigint not null
);

create table if not exists public.carnet_payments (
  id uuid primary key default gen_random_uuid(),
  carnet_id uuid not null references public.carnet_plans(id) on delete cascade,
  external_reference text not null unique,
  amount_cents integer not null check (amount_cents > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  mercadopago_payment_id text unique,
  created_at bigint not null,
  approved_at bigint,
  updated_at bigint not null
);

create index if not exists carnet_payments_carnet_idx on public.carnet_payments(carnet_id, status);
create index if not exists carnet_plans_phone_idx on public.carnet_plans(phone);

alter table public.carnet_plans enable row level security;
alter table public.carnet_payments enable row level security;

revoke all on table public.carnet_plans, public.carnet_payments from anon, authenticated;
grant select, insert, update, delete on table public.carnet_plans, public.carnet_payments to service_role;
