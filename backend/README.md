# Content Panel API

REST API for the client and content tracking panel.

**Stack:** Node.js 24, Fastify 5, TypeScript, Kysely, PostgreSQL 16, Zod, Docker

## Run locally

Requires Docker.

```bash
cp .env.example .env
docker compose up -d --build
docker compose run --rm migrate node dist/db/seed.js
curl http://127.0.0.1:3002/api/health
```

Demo user: `demo@panel.local` / `change-me-please`

For development with reload, start only the database and run the API with Node.js 22+:

```bash
docker compose up -d db
npm install
npm run db:migrate
npm run db:seed
npm run dev   # http://localhost:4000
```

## Tests

API tests run the real app (`fastify.inject`) against a separate PostgreSQL database that is recreated and migrated on each run. With the Compose database running:

```bash
npm test
```

They cover authentication, client and content CRUD, the client–content relation, validation errors, filters, overdue rules and dashboard numbers. Override the database with `TEST_DATABASE_URL`.

## Architecture

```
src/
  config/        environment validation (the app does not start with invalid config)
  db/            connection, table types, migrations, seed
  modules/       auth, clients, contents, dashboard, health
                 routes (HTTP) → service (business rules) → repository (queries)
  shared/        error types, central error handler, validation helpers
```

- Validation with Zod on every request; the database enforces the same rules with `NOT NULL`, `CHECK`, foreign keys and unique indexes.
- A single error format: `{ "error": { "code", "message", "details": [{ "field", "message" }] } }`.
- Aggregates (content counts per client and per status) are computed in SQL, not in application code.
- Turkish-aware case-insensitive search, sorting and unique client names (ICU `tr` collation).

## Data model

| Table | Purpose |
|---|---|
| `users` | Account managers who sign in |
| `sessions` | Active sessions; stores a SHA-256 hash of the cookie token |
| `clients` | Brands the agency works with |
| `contents` | Content items; each belongs to one client (`ON DELETE RESTRICT`) |

Content `type`: `social_post`, `blog_post`, `web_page`, `other`
Content `status`: `draft`, `in_review`, `published`

## Endpoints

All endpoints except health and login require the session cookie.

| Method | Path | Description |
|---|---|---|
| GET | `/api/health` | Service and database status |
| POST | `/api/auth/login` | Sign in, sets the session cookie |
| POST | `/api/auth/logout` | Sign out |
| GET | `/api/auth/me` | Current user |
| GET | `/api/clients?q=` | Clients with content counts per status |
| POST | `/api/clients` | Create a client |
| GET | `/api/clients/:id` | Client detail with content counts |
| PATCH | `/api/clients/:id` | Update a client |
| DELETE | `/api/clients/:id` | Delete a client without content |
| GET | `/api/contents?status=&clientId=&type=&q=&sort=` | Contents with client; `meta.statusCounts` holds per-status counts for the other filters |
| POST | `/api/contents` | Create a content item (starts as `draft` unless a status is given) |
| GET | `/api/contents/:id` | Content detail |
| PATCH | `/api/contents/:id` | Update a content item |
| PATCH | `/api/contents/:id/status` | Change only the status |
| DELETE | `/api/contents/:id` | Delete a content item |
| GET | `/api/dashboard/summary` | Totals, counts per status, overdue count, latest items per status, items needing attention |

`sort` accepts `-updatedAt` (default), `dueDate`, `-createdAt`, `title`. Each content response includes `isOverdue`, computed in the database against the current date in Europe/Istanbul.

## Environment

See [`.env.example`](.env.example). `DATABASE_URL`, `PORT` and `CORS_ORIGIN` are used by the API; `POSTGRES_*`, `DB_PORT` and `API_PORT` by Docker Compose; `SEED_*` by the seed script.
