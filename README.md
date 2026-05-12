# ⭐ Star Idiomas — Portal de Aulas

Sistema de gestão de aulas particulares com acesso para professores e alunos.

---

## Stack
- **Frontend**: React + Vite → deploy no Vercel
- **Banco + Auth + Storage**: Supabase (gratuito)
- **Sem backend separado** — tudo direto pelo Supabase

---

## Passo 1 — Supabase (banco de dados)

1. Acesse [supabase.com](https://supabase.com) e entre no seu projeto
2. Vá em **SQL Editor** e cole TODO o conteúdo do arquivo `SUPABASE_SETUP.sql`
3. Clique em **Run** — as tabelas, políticas e trigger serão criados
4. Vá em **Storage → New bucket**, crie um bucket chamado `materiais` (deixe privado)

---

## Passo 2 — Criar conta do professor no Supabase

O professor precisa ser criado manualmente (só uma vez):

1. No Supabase, vá em **Authentication → Users → Add user**
2. Preencha o e-mail e senha do professor
3. Anote o UUID gerado
4. No **SQL Editor**, execute:
```sql
insert into profiles (id, nome, role)
values ('<UUID_DO_PROFESSOR>', 'Nome do Professor', 'professor');
```

---

## Passo 3 — Deploy no Vercel

1. Suba esta pasta para o GitHub (crie um repositório)
   - **IMPORTANTE**: o arquivo `.env` já está no `.gitignore` — ele NÃO vai pro GitHub
2. Acesse [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório
3. Em **Environment Variables**, adicione:
   - `VITE_SUPABASE_URL` = `https://dinuicajbvlcatthqgrc.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = sua publishable key
4. Clique em **Deploy**

Pronto! O Vercel vai gerar uma URL como `https://star-idiomas.vercel.app`

---

## Passo 4 — Domínio personalizado (opcional)

Para usar `portal.staridiomas.com`:
1. No Vercel, vá em **Settings → Domains** e adicione `portal.staridiomas.com`
2. No painel do seu domínio (ex: GoDaddy, Registro.br), adicione um registro CNAME:
   - Nome: `portal`
   - Valor: `cname.vercel-dns.com`

---

## Como usar

### Professor
1. Acessa o portal e faz login com suas credenciais
2. Clica em **+ Novo Aluno** para cadastrar um aluno (cria o acesso dele automaticamente)
3. Compartilha o e-mail e senha com o aluno
4. Após cada aula, clica em **+ Registrar Aula** e preenche:
   - Aluno, data, duração, presença, conteúdo, link do Meet e materiais

### Aluno
1. Acessa o portal com o e-mail e senha fornecidos pelo professor
2. Vê a próxima aula com botão direto para o Google Meet
3. Consulta histórico completo de aulas e materiais enviados

---

## Arquivos do projeto

```
src/
  pages/
    Login.jsx             — Tela de login
    ProfessorDashboard.jsx — Painel do professor
    AlunoDashboard.jsx    — Painel do aluno
    RegistrarAula.jsx     — Formulário de registro de aula
    CadastrarAluno.jsx    — Cadastro de novo aluno
  components/
    Navbar.jsx            — Barra de navegação
  hooks/
    useAuth.jsx           — Contexto de autenticação
  lib/
    supabase.js           — Cliente Supabase
```
