-- =====================================================
--  SETUP DO SUPABASE — rode tudo de uma vez no
--  SQL Editor do Supabase (botão "Run").
--  Antes, troque SEU-EMAIL-AQUI no final pelo e-mail
--  que você vai usar para entrar no painel.
-- =====================================================

-- Conteúdo do site (uma única linha com todo o JSON)
create table if not exists public.site (
  id int primary key default 1 check (id = 1),
  conteudo jsonb not null,
  atualizado_em timestamptz not null default now()
);

-- Quem pode editar o site
create table if not exists public.admins (
  email text primary key
);

alter table public.site enable row level security;
alter table public.admins enable row level security;

grant select on public.site to anon, authenticated;
grant insert, update on public.site to authenticated;
grant select on public.admins to authenticated;

-- Verifica se quem está logado é admin
create or replace function public.eh_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admins
    where lower(email) = lower(auth.jwt() ->> 'email')
  );
$$;

-- Regras da tabela site: todos leem, só admin escreve
drop policy if exists "site: leitura publica" on public.site;
create policy "site: leitura publica" on public.site
  for select using (true);

drop policy if exists "site: admin cria" on public.site;
create policy "site: admin cria" on public.site
  for insert to authenticated with check (public.eh_admin());

drop policy if exists "site: admin altera" on public.site;
create policy "site: admin altera" on public.site
  for update to authenticated using (public.eh_admin()) with check (public.eh_admin());

-- Regras da tabela admins: cada um só vê a própria linha
drop policy if exists "admins: ve a si mesmo" on public.admins;
create policy "admins: ve a si mesmo" on public.admins
  for select to authenticated using (lower(email) = lower(auth.jwt() ->> 'email'));

-- Pasta de imagens (pública para leitura)
insert into storage.buckets (id, name, public)
values ('imagens', 'imagens', true)
on conflict (id) do update set public = true;

drop policy if exists "imagens: leitura publica" on storage.objects;
create policy "imagens: leitura publica" on storage.objects
  for select using (bucket_id = 'imagens');

drop policy if exists "imagens: admin envia" on storage.objects;
create policy "imagens: admin envia" on storage.objects
  for insert to authenticated with check (bucket_id = 'imagens' and public.eh_admin());

drop policy if exists "imagens: admin altera" on storage.objects;
create policy "imagens: admin altera" on storage.objects
  for update to authenticated using (bucket_id = 'imagens' and public.eh_admin());

drop policy if exists "imagens: admin apaga" on storage.objects;
create policy "imagens: admin apaga" on storage.objects
  for delete to authenticated using (bucket_id = 'imagens' and public.eh_admin());

-- E-mail que pode entrar no painel
insert into public.admins (email) values ('vittoriopaiva@gmail.com')
on conflict (email) do nothing;
