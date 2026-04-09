-- ================================================
-- SCHEMA SUPABASE — Agente de Landing Pages
-- Ejecutar en el SQL Editor de Supabase
-- ================================================

create table if not exists landing_pages (
  id uuid default gen_random_uuid() primary key,
  product_name text not null,
  shopify_product_id bigint,
  shopify_url text,
  landing_data text,
  status text default 'borrador',
  created_at timestamptz default now(),
  updated_at timestamptz
);

create index if not exists idx_landings_created on landing_pages(created_at desc);
create index if not exists idx_landings_status on landing_pages(status);

alter table landing_pages enable row level security;
create policy "Allow all for service role" on landing_pages for all using (true);
