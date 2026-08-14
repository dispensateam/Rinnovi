-- ============================================================================
-- Rinnovi — schema completo e idempotente
-- Incollare per intero nel SQL Editor di Supabase ed eseguire.
-- Puo' essere rieseguito piu' volte senza effetti collaterali.
-- ============================================================================

-- Estensioni ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- Funzione trigger condivisa: aggiorna updated_at a ogni UPDATE --------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- lists
-- ============================================================================
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  icon text not null default 'user',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists lists_user_id_idx on public.lists (user_id);

drop trigger if exists set_updated_at on public.lists;
create trigger set_updated_at
  before update on public.lists
  for each row execute function public.set_updated_at();

-- ============================================================================
-- categories
-- ============================================================================
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  color text not null default '#6C4BF6',
  icon text not null default 'tag',
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists categories_user_id_idx on public.categories (user_id);

drop trigger if exists set_updated_at on public.categories;
create trigger set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

-- ============================================================================
-- payment_methods
-- ============================================================================
create table if not exists public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  icon text not null default 'credit-card',
  color text not null default '#6C4BF6',
  last_four text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payment_methods_user_id_idx on public.payment_methods (user_id);

drop trigger if exists set_updated_at on public.payment_methods;
create trigger set_updated_at
  before update on public.payment_methods
  for each row execute function public.set_updated_at();

-- ============================================================================
-- subscriptions
-- ============================================================================
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null default '',
  notes text not null default '',
  amount numeric(12,2) not null default 0,
  currency_code text not null default 'EUR',
  billing_cycle text not null default 'monthly',
  custom_cycle_days int not null default 30,
  first_billing_date date not null default current_date,
  is_active boolean not null default true,
  is_trial boolean not null default false,
  trial_end_date date,
  brand_color text not null default '#6C4BF6',
  icon_url text not null default '',
  domain text not null default '',
  cancellation_url text not null default '',
  list_id uuid references public.lists(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  payment_method_id uuid references public.payment_methods(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint subscriptions_billing_cycle_check check (
    billing_cycle in (
      'weekly','biweekly','monthly','bimonthly','quarterly',
      'semiannual','annual','biennial','custom'
    )
  )
);

create index if not exists subscriptions_user_id_idx on public.subscriptions (user_id);
create index if not exists subscriptions_list_id_idx on public.subscriptions (list_id);
create index if not exists subscriptions_is_active_idx on public.subscriptions (is_active);

drop trigger if exists set_updated_at on public.subscriptions;
create trigger set_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

-- ============================================================================
-- price_changes
-- ============================================================================
create table if not exists public.price_changes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  changed_at date not null default current_date,
  old_amount numeric(12,2) not null default 0,
  new_amount numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists price_changes_user_id_idx on public.price_changes (user_id);
create index if not exists price_changes_subscription_id_idx on public.price_changes (subscription_id);

drop trigger if exists set_updated_at on public.price_changes;
create trigger set_updated_at
  before update on public.price_changes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Row Level Security
-- Senza queste policy i dati sarebbero leggibili da chiunque: obbligatorie.
-- ============================================================================
alter table public.lists            enable row level security;
alter table public.categories       enable row level security;
alter table public.payment_methods  enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.price_changes    enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array[
    'lists','categories','payment_methods','subscriptions','price_changes'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || '_select_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_insert_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_update_own', t);
    execute format('drop policy if exists %I on public.%I', t || '_delete_own', t);

    execute format(
      'create policy %I on public.%I for select using (auth.uid() = user_id)',
      t || '_select_own', t);
    execute format(
      'create policy %I on public.%I for insert with check (auth.uid() = user_id)',
      t || '_insert_own', t);
    execute format(
      'create policy %I on public.%I for update using (auth.uid() = user_id) with check (auth.uid() = user_id)',
      t || '_update_own', t);
    execute format(
      'create policy %I on public.%I for delete using (auth.uid() = user_id)',
      t || '_delete_own', t);
  end loop;
end;
$$;
