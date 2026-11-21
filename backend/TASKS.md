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
- [ ] CORS origin for the deployed frontend

## Iteration 2
- [x] CI: typecheck and tests against PostgreSQL on every pull request
- [ ] Contents list pagination: `page` and `pageSize` parameters with the total count in `meta`
- [ ] Optional content link (`002_add_content_link` migration, validation, tests)
- [ ] Refresh demo data before release
