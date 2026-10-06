# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this

Needer is an AI-powered reverse marketplace: a user describes a need in natural language, the AI categorizes and tags it, the request is published to a public feed, and professionals come to the client with proposals. See `NEEDER_PROJECT_BIBLE.md` for the full product/architecture spec — read it before making non-trivial changes, it is the source of truth for this project.

**The product never shows a client a list of professionals to browse.** The thing on display is *demand* (open requests), not supply. The homepage feed and the search bar both search requests; pros scan them for work to bid on. An earlier version returned ranked pro cards from `ai-match` and was removed on purpose (2026-08-16) — it made the product a directory, which is the exact dynamic this marketplace exists to invert. Do not reintroduce pro search, pro ranking, or a pro directory.

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint
```

There is no test suite configured in this repo.

## Environment

`.env` requires `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` and `UPLOADTHING_TOKEN` (see `.env.example`). MongoDB is Atlas-hosted — the local machine's IP must be whitelisted or connections fail with `ENOTFOUND`.

**The GitHub repo is public.** Never commit secrets, real test-account passwords, or connection-string hosts — not in code and not in docs. `.env*` (except `.env.example`), `PROGRESS.md`, `.claude/settings.local.json` and `_tmp_*` scripts are gitignored.

On the owner's machine port 3000 is used by another app; run `npx next dev -p 3100` with `NEXTAUTH_URL=http://localhost:3100`. If `MODULE_NOT_FOUND` errors appear inside `node_modules/next` or `typescript`, the install is corrupted: `npm ci` and delete `.next`.

## Architecture

- Next.js App Router, all pages live under `src/app/[locale]/` — every route is locale-aware via `next-intl` (`en`/`pt`). API routes live under `src/app/api/` and are not locale-prefixed.
- `src/proxy.ts` is the routing middleware (Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`) — it wraps `next-intl`'s middleware and matches all paths except API/static routes.
- MongoDB via Mongoose. Models are in `src/lib/models/` (`User`, `Request`, `Proposal`, `Notification`, `Message`, `ProposalDraft`). Connection is a cached singleton in `src/lib/db.ts`.
- Auth is NextAuth Credentials + JWT (30-day sessions). Session carries `id`, `name`, `email`, `role`, `isVerified`. Changing a user's `role` in the DB requires them to log out/in since it's baked into the JWT.
- The core product logic is at `src/app/api/ai-match/route.ts`, which despite the name no longer matches pros: it categorizes the query, persists the request, and notifies every pro whose `proCategory` matches so they come and bid. Categorization is a keyword-based router (`categorize()`) — there is no LLM in this path. A Gemini integration was removed on 2026-09-13 at the owner's request; do not reintroduce an LLM here without asking.
- Mock proposal injection: when a request's category has **no real pros at all**, the system fabricates proposals from the `MOCK_PROS` roster, upserting those pros as real `User` documents (emails like `*@mock.needer.com`) 3–10s later, so `Proposal` documents can reference valid ObjectIds. Without this the post → proposals → compare → accept loop is unwalkable on a fresh DB. Don't assume mock pro IDs (e.g. `'mock-plumb-1'`) are valid ObjectIds anywhere else — they only become real after upsert.
- The public needs feed is `GET /api/requests` (no session required for open requests) — it backs both `/[locale]/requests` and the homepage `LiveNeedsFeed`. Free-text search is the `q` param and runs in MongoDB; don't move it back into the client, which can only ever filter the current page of results.
- Categories (12, each with 2–4 subcategories, EN/PT labels) are defined centrally in `src/lib/categories.ts` — this is the single place category taxonomy changes.
- Next.js 16: `params` in route handlers is a Promise — must `await params` before destructuring.

## Conventions

- i18n: all user-facing text must have both EN and PT variants. Older/core components use `next-intl` message keys (`messages/en.json`, `messages/pt.json`); most newer feature code instead inlines `locale === 'pt' ? 'PT text' : 'EN text'` — match whichever pattern the file you're editing already uses.
- Styling is mixed: most of the app uses Tailwind CSS, but the concierge flow and request-detail pages use React inline styles for a dark, premium look — follow the existing pattern within a given file rather than converting wholesale.
- Monetization fields (`hasSponsoredSpot`, `isPremiumSniper`, `publicReleaseDate`) exist in the DB schema and are read by the match engine, but there is no billing/payment integration yet — don't assume a Stripe layer exists.

## Continuidade de sessão
- No ARRANQUE: lê `PROGRESS.md` por inteiro antes de qualquer ação e resume-me em 2 linhas onde ficámos.
- Ao FECHAR (quando eu disser "wrap" ou correr /wrapup): atualiza `PROGRESS.md` — estado atual, próximos passos priorizados, decisões novas.
- Remove passos já feitos. Mantém <40 linhas. Não apagues decisões importantes; move o obsoleto para o fim.