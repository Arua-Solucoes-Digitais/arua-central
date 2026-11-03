<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- All homepage copy lives in `src/content/site.ts`; sections render from it so text can be edited without touching layout.
- Base projects and their demo links live in `public.base_projects`, edited at `/admin`; only rows with `is_published` reach the public site.
- Brand colors/fonts are tokens in `src/styles.css` (`--aru-*`); components use semantic classes only.
- Admin access = row in `public.user_roles` with role `admin`; public signup is disabled, admins are created in Cloud → Users.
- Analytics are first-party and anonymous (`analytics_events`: no cookies, IP or user id); tracked clicks use `data-track="label"`.
