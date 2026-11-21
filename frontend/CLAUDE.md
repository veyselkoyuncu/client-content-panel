@AGENTS.md

# Client & Content Tracking Panel — Web

Web app for account managers: sign in, overview dashboard, content board and list, clients. Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, TanStack Query. Talks only to the REST API in `../backend`.

## Commands

```
cp .env.example .env.local
npm run dev     # http://localhost:3000, API requests are proxied to API_URL
npm run build
npm run lint
```

The API must be running (see `../backend/README.md`).

## Structure

```
src/
  app/                 routes only: login, (panel) layout and pages
  components/ui/       design-system primitives (button, badge, card, input, drawer, menu, states)
  components/layout/   top navigation, page header
  features/<name>/     api hooks and screen components per domain: auth, dashboard, contents, clients
  lib/                 api client, labels, formatting, helpers
  proxy.ts             redirects to /login when there is no session cookie
```

## API access

- The browser calls `/api/*` on the same origin; `next.config.ts` rewrites it to `API_URL`. The session cookie is therefore first-party and no CORS is needed.
- All requests go through `lib/api.ts`. It throws `ApiError` with `status`, `code`, `message` and field `details` from the backend error format.
- Server state lives in TanStack Query. Query keys come from each feature's `keys` object. After a mutation, invalidate every query that shows the changed data (contents, clients, dashboard).
- A `401` anywhere sends the user to `/login`.

## UI rules

- Design tokens (colors, radii, font) are defined once in `app/globals.css` under `@theme`; components use the token classes, never raw hex values.
- Status colors: draft → neutral, in_review → amber, published → green. Status is never shown by color alone; the label is always visible.
- Labels for statuses and content types come from `lib/labels.ts`.
- Every data view handles loading (skeleton), empty and error (with retry) states.
- Forms show field errors from the API under the matching field and keep the submit button disabled while saving.
- Filters live in the URL query string so views can be shared and survive reloads.
- Layouts must work from 375px to 1440px wide without horizontal scrolling.
- User-facing text is Turkish; code and identifiers are English.
- Dates are shown in Turkish format (`20 Kas`, `20 Kasım 2026`).

## General

- Small components; feature-specific components stay inside their feature folder.
- Comments only where the reason is not obvious from the code.
- Never commit `.env*` files except `.env.example`.

## Workflow

- `main` only changes through pull requests; every change gets its own branch (`feat/…`, `fix/…`, `chore/…`).
- A change is verified locally (`npm run lint`, `npx tsc --noEmit`, and in the browser at desktop and 375px widths) before it is committed.
- Pull requests must pass CI (lint, typecheck and production build) before they are merged.
- Vercel builds a preview deployment for every pull request; check it before merging.

## Deployment

Vercel, root directory `frontend/`, production at `https://client-content-panel-frontend.vercel.app`. `main` deploys automatically. Set `API_URL=https://panel-api.lazyantlab.com`.
