# Content Panel

Client and content tracking panel for agency account managers. Account managers sign in, manage clients, manage content items that belong to a client, move content through its workflow and see an overview dashboard.

## Repository layout

```
backend/    REST API (Fastify, TypeScript, Kysely, PostgreSQL)
frontend/   Web app (Next.js, TypeScript, Tailwind CSS)
docker-compose.yml   PostgreSQL, one-off migration job and API
TASKS.md    Development phases and progress
```

## Commands

Local stack (from the repository root, after `cp .env.example .env`):

```
docker compose up -d --build     # db + migrate + api on 127.0.0.1:3002
docker compose down              # stop, keep data
docker compose down -v           # stop and drop the database volume
docker compose run --rm migrate node dist/db/seed.js   # reset demo data
```

Backend development (inside `backend/`, after `cp .env.example .env` and `docker compose up -d db`):

```
npm run dev          # API with reload on :4000
npm run db:migrate   # apply migrations
npm run db:seed      # reset data: demo user, clients and contents
npm run typecheck
```

## Domain rules

- Every content item belongs to exactly one client (`client_id NOT NULL`, `ON DELETE RESTRICT`).
- Content types: `social_post`, `blog_post`, `web_page`, `other`.
- Content statuses: `draft`, `in_review`, `published`. New content starts as `draft`. Any status can move to any other status.
- Content has an optional due date (planned publish date). Content is overdue when its due date is before today (Europe/Istanbul) and it is not published.
- Client names are unique, case-insensitive with Turkish casing rules.
- Authentication uses an opaque session token in an httpOnly cookie; only its SHA-256 hash is stored in `sessions`. Sessions last 7 days. There is no registration; users come from the seed.
- A client with content cannot be deleted.
- Dashboard numbers are computed with aggregate queries on every request.

## Backend conventions

- Layers per module: `*.routes.ts` (HTTP) → `*.service.ts` (rules) → `*.repository.ts` (queries). Routes never query the database directly.
- Request input is validated with Zod through `parseInput`; failures become `400 VALIDATION_ERROR` with field details.
- Errors are thrown as `AppError` (`notFound`, `conflict`, `validationError`, `unauthorized`) and rendered by the central error handler.
- Response shape: `{ data }` for success, `{ data, meta }` for lists, `{ error: { code, message, details? } }` for errors.
- JSON uses camelCase; the database uses snake_case (Kysely `CamelCasePlugin`).
- Schema changes only through new files in `src/db/migrations/`, registered in `migrations/index.ts`. Never edit a migration that has been deployed.
- Avoid N+1 queries; use joins and aggregates.

## Frontend conventions

- Screens follow the Figma design; shared UI lives in `components/ui`.
- Every data view handles loading, empty and error states.
- Filters live in the URL query string.

## General conventions

- Code, identifiers and commit messages in English; user-facing text in Turkish.
- Comments only where the reason is not obvious from the code.
- Small, focused commits.
- Never commit `.env` files or secrets.

## Deployment

- API and PostgreSQL run with Docker Compose on a Linux VM (ARM64) behind Caddy at `https://panel-api.lazyantlab.com`. The API binds to `127.0.0.1:3002`.
- The frontend is deployed on Vercel from `frontend/`.
