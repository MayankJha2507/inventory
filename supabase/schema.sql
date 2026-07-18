-- Loopstitch — Supabase schema
-- Run this in the Supabase SQL editor, then set VITE_SUPABASE_URL and
-- VITE_SUPABASE_ANON_KEY in .env.

create extension if not exists "pgcrypto";

create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  color text not null default '#10b981',
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku text not null unique,
  name text not null,
  category_id uuid references categories (id) on delete set null,
  description text not null default '',
  notes text not null default '',
  cost_price numeric(10, 2) not null default 0 check (cost_price >= 0),
  selling_price numeric(10, 2) not null default 0 check (selling_price >= 0),
  current_stock integer not null default 0 check (current_stock >= 0),
  min_stock integer not null default 0 check (min_stock >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  date date not null default current_date,
  category text not null default 'General',
  amount numeric(10, 2) not null default 0 check (amount >= 0),
  description text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists inventory_history (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products (id) on delete cascade,
  type text not null check (type in ('sale', 'restock', 'adjustment', 'created')),
  quantity_change integer not null,
  unit_price numeric(10, 2) not null default 0,
  unit_cost numeric(10, 2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists settings (
  id text primary key,
  business_name text not null default 'Loopstitch',
  currency text not null default 'USD',
  low_stock_threshold integer not null default 5,
  theme text not null default 'light'
);

create index if not exists idx_products_category on products (category_id);
create index if not exists idx_history_product on inventory_history (product_id);
create index if not exists idx_history_created on inventory_history (created_at desc);
create index if not exists idx_expenses_date on expenses (date desc);

-- Table privileges — newer Supabase projects don't grant these to anon by
-- default, so RLS policies alone are not enough.
grant usage on schema public to anon, authenticated;
grant all on all tables in schema public to anon, authenticated;
alter default privileges in schema public
  grant all on tables to anon, authenticated;

-- Row Level Security. Auth is not wired up yet, so these policies allow the
-- anon role full access. When you enable Supabase Auth, replace `true` with
-- an auth check such as `auth.uid() is not null`.
alter table categories enable row level security;
alter table products enable row level security;
alter table expenses enable row level security;
alter table inventory_history enable row level security;
alter table settings enable row level security;

create policy "anon full access" on categories for all using (true) with check (true);
create policy "anon full access" on products for all using (true) with check (true);
create policy "anon full access" on expenses for all using (true) with check (true);
create policy "anon full access" on inventory_history for all using (true) with check (true);
create policy "anon full access" on settings for all using (true) with check (true);

insert into settings (id) values ('default') on conflict (id) do nothing;

insert into categories (name, color) values
  ('Amigurumi', '#10b981'),
  ('Wearables', '#8b5cf6'),
  ('Home Decor', '#f59e0b'),
  ('Bags & Accessories', '#0ea5e9'),
  ('Baby', '#f43f5e')
on conflict (name) do nothing;
