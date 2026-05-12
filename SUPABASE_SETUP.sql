-- =============================================
-- STAR IDIOMAS — Setup do Banco (Supabase)
-- Cole e execute no SQL Editor do Supabase
-- =============================================

-- 1. Tabela de perfis
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  nome text not null,
  role text check (role in ('professor', 'aluno')) not null,
  created_at timestamptz default now()
);

-- 2. Vínculo professor ↔ aluno
create table if not exists vinculos (
  id uuid default gen_random_uuid() primary key,
  professor_id uuid references profiles(id) on delete cascade,
  aluno_id uuid references profiles(id) on delete cascade,
  idioma text,
  nivel text,
  created_at timestamptz default now()
);

-- 3. Registros de aula
create table if not exists aulas (
  id uuid default gen_random_uuid() primary key,
  professor_id uuid references profiles(id) on delete cascade,
  aluno_id uuid references profiles(id) on delete cascade,
  data_aula timestamptz not null,
  duracao_min int default 60,
  presenca text check (presenca in ('presente', 'faltou', 'atrasou')),
  conteudo text,
  meet_link text,
  created_at timestamptz default now()
);

-- 4. Materiais por aula
create table if not exists materiais (
  id uuid default gen_random_uuid() primary key,
  aula_id uuid references aulas(id) on delete cascade,
  nome_arquivo text,
  storage_path text,
  created_at timestamptz default now()
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

alter table profiles enable row level security;
alter table vinculos enable row level security;
alter table aulas enable row level security;
alter table materiais enable row level security;

-- profiles: cada um vê o próprio perfil
create policy "Ver proprio perfil" on profiles
  for select using (auth.uid() = id);

create policy "Inserir proprio perfil" on profiles
  for insert with check (auth.uid() = id);

-- vinculos: professor vê os seus; aluno vê os seus
create policy "Professor ve seus vinculos" on vinculos
  for select using (auth.uid() = professor_id);

create policy "Aluno ve seus vinculos" on vinculos
  for select using (auth.uid() = aluno_id);

create policy "Professor insere vinculos" on vinculos
  for insert with check (auth.uid() = professor_id);

-- aulas: professor CRUD nas suas; aluno só lê as dele
create policy "Professor ve suas aulas" on aulas
  for select using (auth.uid() = professor_id);

create policy "Professor insere aulas" on aulas
  for insert with check (auth.uid() = professor_id);

create policy "Professor edita aulas" on aulas
  for update using (auth.uid() = professor_id);

create policy "Aluno ve suas aulas" on aulas
  for select using (auth.uid() = aluno_id);

-- materiais: professor insere; aluno e professor leem
create policy "Professor insere materiais" on materiais
  for insert with check (
    exists (select 1 from aulas where aulas.id = aula_id and aulas.professor_id = auth.uid())
  );

create policy "Acesso a materiais da aula" on materiais
  for select using (
    exists (
      select 1 from aulas
      where aulas.id = aula_id
      and (aulas.professor_id = auth.uid() or aulas.aluno_id = auth.uid())
    )
  );

-- =============================================
-- Trigger: auto-criar perfil ao registrar usuário
-- =============================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', new.email),
    coalesce(new.raw_user_meta_data->>'role', 'aluno')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =============================================
-- Storage bucket para materiais
-- (criar manualmente em Storage > New bucket: "materiais", público = false)
-- =============================================
