# Tasks

## 1. Foundation
- [x] Repository structure, editor and git settings
- [x] Backend skeleton: env validation, error format, health check
- [x] Database schema: users, clients, contents with constraints and triggers
- [x] Docker Compose: db, migration job, API

## 2. Backend API
- [x] Auth: password hashing, login, logout, current user, session cookie, route guard
- [x] Seed: admin user and demo clients/contents
- [x] Clients: list, create, detail with content stats, update, delete (only without content)
- [ ] Contents: list with status/client/type filters, create, detail, update, status update, delete
- [ ] Dashboard summary
- [ ] API tests for CRUD, relations, filters and dashboard numbers

## 3. Deployment (first pass)
- [ ] Compose stack on the VM, Caddy site for `panel-api.lazyantlab.com`
- [ ] Migration and seed on the server, health check over HTTPS

## 4. Frontend
- [ ] Next.js setup, design tokens from Figma, API client, auth guard
- [ ] Login
- [ ] App shell: sidebar, mobile navigation, page header
- [ ] Clients: list, detail, create/edit form
- [ ] Contents: list with filters and inline status change, create/edit form
- [ ] Dashboard
- [ ] Loading, empty and error states; responsive layouts

## 5. Release
- [ ] Vercel deployment and CORS settings
- [ ] Post-deploy checks
- [ ] README
