# Folio — Plataforma de Insights UX

Plataforma SaaS de pesquisa de produto e UX: **pesquisas (surveys)**, **testes de
usabilidade**, **insights de IA**, **biblioteca**, **participantes (LGPD)** e
**segurança**. Trilíngue (PT-BR / EN / ES), tema claro/escuro e 4 paletas.

Este repositório é a **versão real e funcional** construída a partir do handoff de
design `design_handoff_folio` (protótipo React/Babel). A stack escolhida segue a
recomendação do handoff: **React + TypeScript + Vite** no front-end e **Node +
Express + Prisma** no back-end.

> **Status: Fase 1 (fundação + pesquisas ponta a ponta).** Já é possível criar
> conta, montar uma pesquisa, publicá-la, coletar respostas reais por um link
> público e ver os resultados agregados. As demais áreas (usabilidade, insights
> de IA, biblioteca, participantes, segurança) estão no roadmap abaixo.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Front-end | React 18, TypeScript, Vite, React Router, TanStack Query, i18next |
| Back-end | Node 22, Express, Prisma ORM, JWT + bcrypt |
| Banco | SQLite (dev) · Postgres (produção) |
| Design | Tokens CSS do handoff (`src/styles/*.css`) + ícones portados |
| Deploy | Serviço Node único (serve a SPA + API) · Docker / Render |

## Estrutura

```
folio/
├── server/            API Express + Prisma
│   ├── prisma/        schema + migrations + dev.db
│   └── src/
│       ├── routes/    auth · surveys · public (coleta)
│       ├── auth.ts    JWT + bcrypt + middleware
│       └── index.ts   app (serve a SPA em produção)
├── web/               SPA React + TS (Vite)
│   └── src/
│       ├── components/ Icon, Shell, ui/ (Button, Card, Modal, ...)
│       ├── pages/      Auth, Dashboard, SurveyList, SurveyBuilder,
│       │               SurveyResults, PublicSurvey, ComingSoon
│       ├── lib/        api, auth, theme, i18n, types, format
│       ├── locales/    pt / en / es
│       └── styles/     CSS do handoff (verbatim) + app.css
├── Dockerfile · render.yaml · .env.example
```

---

## Rodando localmente

Pré-requisitos: **Node 22+**.

```bash
cd folio

# 1) Instalar dependências (server + web)
npm install            # roda postinstall nos dois pacotes

# 2) Configurar ambiente do servidor
cp .env.example server/.env

# 3) Criar o banco (SQLite) + dados de demonstração
npm run db:setup       # migrate + seed

# 4) Subir tudo (API na :4000, web na :5173)
npm run dev
```

Acesse **http://localhost:5173** e entre com a conta de demonstração:

```
demo@folio.app  /  folio123
```

Há uma pesquisa de exemplo já publicada com algumas respostas, então o painel e os
resultados já mostram dados. Para testar a coleta real, abra uma pesquisa →
**Compartilhar link** e responda em `/s/:publicId`.

---

## Build de produção (serviço único)

O servidor serve a SPA já compilada, então o produto inteiro sobe como **um único
serviço Node**.

```bash
npm run build          # compila server + web
cd server && NODE_ENV=production npm start
```

### Docker

```bash
docker build -t folio .
docker run -p 4000:4000 -e DATABASE_URL="file:/data/folio.db" -e JWT_SECRET="..." \
  -v $PWD/data:/data folio
```

### Ir para produção (Postgres)

O dev usa SQLite por conveniência. Para um banco durável:

1. Em `server/prisma/schema.prisma`, troque `provider = "sqlite"` por
   `provider = "postgresql"`.
2. Defina `DATABASE_URL` apontando para o Postgres.
3. `npx prisma migrate deploy`.

O arquivo `render.yaml` já provisiona um web service + Postgres no
[Render](https://render.com) (faça o passo 1 antes de usá-lo).

---

## Variáveis de ambiente

Veja `.env.example`. As principais:

- `JWT_SECRET` — segredo de assinatura dos tokens (troque em produção).
- `DATABASE_URL` — conexão do banco.
- `CORS_ORIGIN` — origem do front em dev (`http://localhost:5173`).
- `WEB_DIST` — caminho da SPA compilada servida em produção.

---

## API (Fase 1)

| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/signup` · `/login` · `/logout` | autenticação |
| GET | `/api/auth/me` · PATCH `/api/auth/me/prefs` | usuário + preferências |
| GET/POST | `/api/surveys` | listar / criar pesquisa |
| GET/PUT/DELETE | `/api/surveys/:id` | detalhe / editar / excluir |
| PATCH | `/api/surveys/:id/status` | publicar / pausar / encerrar |
| GET | `/api/surveys/:id/results` | resultados agregados |
| GET | `/api/public/surveys/:publicId` | pesquisa publicada (sem auth) |
| POST | `/api/public/surveys/:publicId/responses` | enviar resposta (sem auth) |

---

## Roadmap (próximas fases)

A Fase 1 entrega a fundação (design system, i18n, tema, auth real) e o fluxo
completo de **Pesquisas**. As fases seguintes recriam as telas restantes do
handoff sobre a mesma base:

- **Fase 2 — Pesquisas avançadas:** mais tipos de pergunta (ranking, upload,
  card sorting, diferencial semântico), lógica condicional, explorador de
  respostas individuais (master-detail) e segmentos.
- **Fase 3 — Testes de usabilidade:** conector Figma, construtor de tarefas,
  gravação de sessões, player com timeline e heatmap.
- **Fase 4 — Insights de IA:** geração de pesquisa por objetivo, sumarização,
  detecção de temas/sentimento, dores e oportunidades priorizadas
  (via API da Anthropic).
- **Fase 5 — Biblioteca, Participantes (CRM + LGPD) e Segurança (2FA, sessões,
  trilha de auditoria).**

Cada fase mantém os tokens de design e os componentes de UI já estabelecidos.

---

## Mover para um repositório dedicado

Esta pasta é autocontida. Para extraí-la para um repositório próprio:

```bash
# a partir da raiz do repo atual
git subtree split --prefix=folio -b folio-only
mkdir ../folio-standalone && cd ../folio-standalone && git init
git pull ../incursiongame folio-only
# então: git remote add origin <novo-repo>.git && git push -u origin main
```

Ou simplesmente copie a pasta `folio/` para um novo diretório e rode `git init`.
