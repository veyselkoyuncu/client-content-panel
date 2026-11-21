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
- [ ] Collapsible sidebar as the main navigation (icon rail when collapsed) with client shortcuts
- [ ] Mobile: compact sticky top bar with the sidebar as a drawer
- [ ] Footer with app version and API status
- [ ] Content type badges with distinct colors
- [ ] Client filter: top clients as chips, the rest in a searchable popover
- [ ] Board: limited cards per column with "show more"
- [ ] Board on mobile: one column at a time with status tabs, review column first
- [ ] List view: server-side pagination
- [ ] Content link: field in the form, link icon on cards and rows
- [ ] Login: split layout with product intro and a demo account shortcut
- [ ] Toast feedback for create, update, status change and delete

## Quality
- [ ] Loading, empty and error states on every screen
- [ ] Responsive layouts (mobile navigation, stacked panels, cards instead of tables)
- [ ] Accessibility pass: keyboard navigation, focus states, labels

## Release
- [x] Vercel deployment with `API_URL`
- [ ] Post-deploy checks against the live API
- [ ] README
