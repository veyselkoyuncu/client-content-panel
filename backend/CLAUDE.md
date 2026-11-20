# Client & Content Tracking Panel — API

REST API for the content tracking panel: session auth, clients, contents and dashboard summary. Fastify, TypeScript, Kysely, PostgreSQL. Runs independently of the frontend.

## Commands

```
cp .env.example .env
docker compose up -d --build                          # db + migrate + api on 127.0.0.1:3002
docker compose run --rm migrate node dist/db/seed.js  # reset demo data
docker compose down                                   # stop, keep data
docker compose down -v                                # stop and drop the database volume

docker compose up -d db   # database only, then:
npm run dev               # API with reload on :4000
npm run db:migrate
npm run db:seed
npm run typecheck
npm test                  # API tests against a recreated panel_test database
```

## Structure

```
src/
  server.ts, app.ts        bootstrap, plugins, route registration
  config/env.ts            environment validation
  db/                      connection, table types, migrations, migrator, seed
  modules/<name>/          *.routes.ts → *.service.ts → *.repository.ts, *.schemas.ts
  shared/                  errors, error handler, validation helpers
```

## Domain rules

- Every content item belongs to exactly one client (`client_id NOT NULL`, `ON DELETE RESTRICT`).
- Content types: `social_post`, `blog_post`, `web_page`, `other`.
- Content statuses: `draft`, `in_review`, `published`. New content starts as `draft`. Any status can move to any other status.
- Content has an optional due date (planned publish date). Content is overdue when its due date is before today (Europe/Istanbul) and it is not published.
- Client names are unique, case-insensitive with Turkish casing rules.
- A client with content cannot be deleted.
- Dashboard numbers are computed with aggregate queries on every request.
- Authentication uses an opaque session token in an httpOnly cookie; only its SHA-256 hash is stored in `sessions`. Sessions last 7 days. There is no registration; users come from the seed.

## Conventions

- Routes never query the database directly; services hold the rules, repositories hold the queries.
- Request input is validated with Zod through `parseInput`; failures become `400 VALIDATION_ERROR` with field details.
- Errors are thrown as `AppError` (`notFound`, `conflict`, `validationError`, `unauthorized`) and rendered by the central error handler.
- Response shape: `{ data }` for success, `{ data, meta }` for lists, `{ error: { code, message, details? } }` for errors.
- JSON uses camelCase; the database uses snake_case (Kysely `CamelCasePlugin`).
- Schema changes only through new files in `src/db/migrations/`, registered in `migrations/index.ts`. Never edit a migration that has been deployed.
- Avoid N+1 queries; use joins and aggregates.
- Code, identifiers and commit messages in English; user-facing messages in Turkish.
- Comments only where the reason is not obvious from the code.
- Never commit `.env` files or secrets.

## Deployment

Docker Compose on a Linux VM (ARM64) behind Caddy at `https://panel-api.lazyantlab.com`. The API binds to `127.0.0.1:3002`; the database port is bound to loopback only.
