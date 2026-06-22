# Robiwood — Controle de Ferramentas Especiais

Sistema completo em Next.js (App Router) para controle de ferramentas especiais com:

- Cadastro de ferramentas: **código, descrição, posição, quantidade, estoque mínimo**
- Login obrigatório (NextAuth) — todo movimento registra **quem liberou** (usuário logado) e **quem solicitou** (nome do funcionário)
- Movimentações: **Saída, Retorno, Entrada, Ajuste**, com data/hora automática
- **Histórico completo** de movimentações com filtros (tipo, período, solicitante)
- **Relatórios**: indicadores por tipo, top solicitantes, ferramentas mais movimentadas, itens em nível crítico, e **exportação em CSV**
- Gestão de usuários (perfis: Administrador, Almoxarife, Funcionário)

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Prisma ORM (SQLite local / PostgreSQL em produção)
- NextAuth v5 (Credentials) com senha criptografada (bcrypt)

## Rodando localmente

```bash
npm install
npx prisma migrate dev --name init
npm run seed      # cria usuário admin inicial
npm run dev
```

Acesse `http://localhost:3000` e entre com:

- **E-mail:** admin@robiwood.com
- **Senha:** admin123

⚠️ Troque essa senha (ou crie outro admin) logo após o primeiro acesso, na tela **Usuários**.

## Publicando de forma gratuita

A combinação 100% gratuita recomendada é **Vercel (hospedagem) + Neon (banco PostgreSQL gratuito)**, pois o Vercel não mantém arquivos SQLite persistentes em produção (ambiente serverless).

### Passo 1 — Banco de dados gratuito (Neon)

1. Crie uma conta em https://neon.tech (plano free).
2. Crie um projeto e copie a **connection string** (algo como `postgresql://usuario:senha@host/banco?sslmode=require`).
3. No arquivo `prisma/schema.prisma`, troque o provider:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Passo 2 — Subir o código para o GitHub

```bash
git init
git add .
git commit -m "Sistema de controle de ferramentas - Robiwood"
git branch -M main
git remote add origin <url-do-seu-repositorio>
git push -u origin main
```

### Passo 3 — Deploy na Vercel (gratuito)

1. Acesse https://vercel.com e importe o repositório do GitHub.
2. Em **Environment Variables**, adicione:
   - `DATABASE_URL` → connection string do Neon
   - `AUTH_SECRET` → gere com `npx auth secret` (ou qualquer string aleatória longa)
   - `NEXTAUTH_URL` → URL pública do seu deploy (ex: `https://seu-projeto.vercel.app`)
3. Clique em **Deploy**.
4. Após o primeiro deploy, rode as migrações no banco de produção (uma vez), localmente apontando para o Neon:

```bash
DATABASE_URL="<connection string do Neon>" npx prisma migrate deploy
DATABASE_URL="<connection string do Neon>" npm run seed
```

Pronto — o sistema estará publicado gratuitamente e acessível pela internet.

### Alternativas gratuitas equivalentes

- **Hospedagem:** Vercel, Netlify ou Render (planos free)
- **Banco de dados:** Neon (Postgres), Turso (SQLite distribuído) ou Supabase (Postgres)

## Estrutura principal

```
app/
  login/                 → tela de login
  ferramentas/           → listagem, cadastro e detalhe/edição
  movimentos/novo/       → registrar saída/retorno/entrada/ajuste
  historico/             → histórico com filtros
  relatorios/            → indicadores + exportação CSV
  usuarios/              → gestão de usuários (login/liberação)
  api/                   → rotas REST (ferramentas, movimentos, usuários, relatórios)
prisma/
  schema.prisma          → modelo de dados
  seed.js                → cria usuário admin inicial
```

## Perfis de usuário

- **ADMIN** — gerencia usuários, exclui ferramentas, acesso total
- **ALMOXARIFE / FUNCIONARIO** — cadastra ferramentas e registra movimentações, mas não gerencia usuários nem exclui itens

## Observações de segurança

- Senhas armazenadas com hash bcrypt (nunca em texto puro)
- Todas as rotas (exceto `/login`) exigem autenticação (middleware)
- Toda movimentação grava automaticamente: ferramenta, tipo, quantidade antes/depois, solicitante, **usuário logado que liberou**, data e hora
"# robiwood-ferramentas" 
