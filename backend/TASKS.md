# Tasks

## Foundation
- [x] Fastify skeleton: env validation, error format, health check
- [x] Database schema: users, sessions, clients, contents with constraints and triggers
- [x] Docker Compose: db, migration job, API

## API
- [x] Auth: password hashing, login, logout, current user, session cookie, route guard
- [x] Seed: demo user, clients and contents
- [x] Clients: list, create, detail with content stats, update, delete (only without content)
- [x] Contents: list with status/client/type filters, create, detail, update, status update, delete
- [x] Dashboard summary
- [x] API tests for CRUD, relations, filters and dashboard numbers

## Deployment
- [x] Compose stack on the VM, Caddy site for `panel-api.lazyantlab.com`
- [x] Migration and seed on the server, health check over HTTPS

## Iteration 2
- [x] CI: typecheck and tests against PostgreSQL on every pull request
- [x] Contents list pagination: `page` and `pageSize` parameters with the total count in `meta`
- [x] Optional content link (`002_add_content_link` migration, validation, tests)

## Iteration 3: status workflow and history
- [x] Status transition rules enforced in the service layer (`409 INVALID_TRANSITION`)
- [x] Published content is read-only; `POST /api/contents/:id/unpublish` returns it to draft
- [x] New content can only start as `draft` or `in_review`
- [x] `003_content_status_events` migration with a backfilled initial event per content
- [x] Status changes and their history event written in one transaction, with the acting user
- [x] `GET /api/contents/:id/history` and paginated `GET /api/activity` with client and status filters
- [x] Tests for transitions, locking, unpublish and history
- [x] Activity search by content title (`q`, Turkish-aware) with a test

## Release
- [ ] Refresh demo data before release
- [ ] CORS origin for the deployed frontend
