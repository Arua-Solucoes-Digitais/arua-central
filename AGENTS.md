## Project rules
- All homepage copy lives in `src/content/site.ts`; sections render from it so text can be edited without touching layout.
- Base projects and their demo links live in the `base_projects` table, edited at `/admin`; only rows with `is_published` reach the public site.
- Brand colors/fonts are tokens in `src/styles.css` (`--aru-*`); components use semantic classes only.
- The project runs without external services: data lives in SQLite at `data/arua.db` (never versioned) and browser code reaches it only through server functions in `src/lib/api.ts`, which check permission on every call.
- Admin access = row in `users`; there is no public signup, admins are created or reset in the terminal with `npm run admin`.
- Analytics are first-party and anonymous (`analytics_events`: no cookies, IP or user id); tracked clicks use `data-track="label"`.
