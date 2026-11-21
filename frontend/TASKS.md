# Tasks

## Foundation
- [x] Next.js app with TypeScript, Tailwind CSS and ESLint
- [x] Design tokens and UI primitives
- [x] API client, same-origin API proxy, query provider
- [x] Session guard and login screen
- [x] App shell: top navigation, user menu, sign out

## Screens
- [x] Overview: greeting, status summary cards, items needing attention, client distribution
- [x] Content board grouped by status with status change menu
- [x] Content list view with status tabs and filters
- [x] Content create/edit panel
- [x] Clients: list with search, detail with stats and contents
- [x] Client create/edit panel

## Iteration 2
- [x] CI: lint, typecheck and production build on every pull request
- [x] Collapsible sidebar as the main navigation (icon rail when collapsed) with client shortcuts
- [x] Mobile: compact sticky top bar with the sidebar as a drawer
- [x] Footer with app version and API status
- [x] Content type badges with distinct colors
- [x] Client filter: top clients as chips, the rest in a searchable popover
- [x] Board: limited cards per column with "show more"
- [x] Board on mobile: one column at a time with status tabs, review column first
- [x] List view: server-side pagination
- [x] Content link: field in the form, link icon on cards and rows
- [x] Login: split layout with product intro and a demo account shortcut
- [x] Toast feedback for create, update, status change and delete

## Quality
- [x] Loading, empty and error states on every screen, 404 and error pages
- [x] Responsive layouts (mobile navigation, stacked panels, cards instead of tables)
- [x] Accessibility pass: keyboard navigation in menus, focus trap in panels, labels, reduced motion

## Release
- [x] Vercel deployment with `API_URL`
- [ ] Post-deploy checks against the live API
- [ ] README
