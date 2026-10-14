# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this

Needer is an AI-powered reverse marketplace: a user describes a need in natural language, the AI categorizes and tags it, the request is published to a public feed, and professionals come to the client with proposals. See `NEEDER_PROJECT_BIBLE.md` for the full product/architecture spec — read it before making non-trivial changes, it is the source of truth for this project.

**The product never shows a client a list of professionals to browse.** The thing on display is *demand* (open requests), not supply. The homepage feed and the search bar both search requests; pros scan them for work to bid on. An earlier version returned ranked pro cards from `ai-match` and was removed on purpose (2026-08-16) — it made the product a directory, which is the exact dynamic this marketplace exists to invert. Do not reintroduce pro search, pro ranking, or a pro directory.

## Commands

```bash
npm run dev      # start dev server (http://localhost:3100)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint
```

There is no test suite configured in this repo.

## Environment

`.env` requires `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL` and `UPLOADTHING_TOKEN` (see `.env.example`). MongoDB is Atlas-hosted — the local machine's IP must be whitelisted or connections fail with `ENOTFOUND`.

**The GitHub repo is public.** Never commit secrets, real test-account passwords, or connection-string hosts — not in code and not in docs. `.env*` (except `.env.example`), `PROGRESS.md`, `.claude/settings.local.json` and `_tmp_*` scripts are gitignored.

On the owner's machine port 3000 is used by another app, so `npm run dev`/`start` are pinned to 3100 and `NEXTAUTH_URL` must be `http://localhost:3100`. If `MODULE_NOT_FOUND` errors appear inside `node_modules/next` or `typescript`, the install is corrupted: `npm ci` and delete `.next`.

## Architecture

- Next.js App Router, all pages live under `src/app/[locale]/` — every route is locale-aware via `next-intl` (`en`/`pt`). API routes live under `src/app/api/` and are not locale-prefixed.
- `src/proxy.ts` is the routing middleware (Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`) — it wraps `next-intl`'s middleware and matches all paths except API/static routes.
- MongoDB via Mongoose. Models are in `src/lib/models/` (`User`, `Request`, `Proposal`, `Notification`, `Message`, `ProposalDraft`). Connection is a cached singleton in `src/lib/db.ts`.
- **Roles:** every account registers as `client` (no role choice at sign-up; `/api/auth/register` has no role field). Becoming `pro` is **never self-service**: it will be an application (professional data + proof of qualification) reviewed by an admin — owner's rule, 2026-10-14. No API may let a user set their own role. `/[locale]/pro` sends logged-out visitors to register/login with `callbackUrl` back to `/pro`. A pro can also post requests. Post-auth redirects must go through `safeCallbackUrl()` (`src/lib/redirect.ts`).
- Auth is NextAuth Credentials + JWT (30-day sessions). Session carries `id`, `name`, `email`, `role`, `isVerified`. Changing a user's `role` in the DB requires them to log out/in since it's baked into the JWT.
- **Request creation has exactly one write path: `POST /api/requests`** (form at `/[locale]/requests/new`). The concierge (`/[locale]/concierge`) never saves: it runs `categorize()` from `src/lib/categorize.ts` in the browser (keyword rules, no LLM — Gemini was removed 2026-09-13; ask the owner before reintroducing one) and redirects to `/requests/new?q=&category=&subcategory=&district=&budget=&urgency=` so the client confirms everything. `categorize()` returns real keys or `''` — never a guessed default. `/api/ai-match` and its mock-proposal injection were deleted on 2026-10-12, and the UI's mock-pro fallbacks on 2026-10-14. Never show invented pros, ratings, reviews or stats — empty states must say what is actually true.
- `notifyMatchingPros()` (`src/lib/notifications.ts`) pings every pro whose `proCategory` equals the request's subcategory or category — called from `POST /api/requests`.
- Location = **district** (`src/lib/districts.ts`: 18 districts + Açores + Madeira). `Request.district` is the key; `Request.location` holds the district capital's coordinates (not the client's address); `locationLabel` is an optional free-text town. Requests created before 2026-10 have no `district`.
- Reviews (`POST /api/users/[id]/review`) require `requestId` of a **closed** request owned by the reviewer whose `acceptedByProId` is that pro; one review per job (`ratings.requestId`).
- The public needs feed is `GET /api/requests` (no session required for open requests) — it backs both `/[locale]/requests` and the homepage `LiveNeedsFeed`. Free-text search is the `q` param and runs in MongoDB; don't move it back into the client, which can only ever filter the current page of results.
- Categories (12, each with 2–5 subcategories, EN/PT labels) are defined centrally in `src/lib/categories.ts` — this is the single place category taxonomy changes. Use `isValidSubcategory()` / `isValidProCategory()` to validate keys.
- Next.js 16: `params` in route handlers is a Promise — must `await params` before destructuring.

## Conventions

- **API input validation:** every write route parses its body with a zod schema via `parseBody(request, schema)` from `src/lib/validation.ts` (bad JSON/invalid fields → 400, unknown keys stripped). Dynamic `[id]` routes check `isObjectId(id)` first (→ 404). Reuse the shared pieces there (`text(max, min)`, `euros`, `objectId`, `password` (8–72), `email`, `phone`, `uploadedImageUrl`/`avatarUrl` — only Uploadthing URLs, `isValidNif`). Don't hand-roll `await request.json()` + truthiness checks.
- Login errors are deliberately identical for unknown email and wrong password (no account enumeration).
- **Rate limiting:** `await rateLimit(key, limit, windowMs)` from `src/lib/rateLimit.ts` — counters live in MongoDB (`ratelimits`, TTL-expired), so they hold across Vercel instances; never go back to in-memory. Login/register/password/upload count every attempt; content routes (requests, proposals, messages, reviews, verification) count only after `parseBody` succeeds, so honest form mistakes don't burn the quota. Return `tooManyRequests` with 429.
- **Security headers + CSP** are set in `next.config.ts`. Adding an external origin (a script, an image host, a payment redirect form) means extending the CSP there, or the browser silently blocks it.

- i18n: all user-facing text must have both EN and PT variants. Older/core components use `next-intl` message keys (`messages/en.json`, `messages/pt.json`); most newer feature code instead inlines `locale === 'pt' ? 'PT text' : 'EN text'` — match whichever pattern the file you're editing already uses.
- Styling is mixed: most of the app uses Tailwind CSS, but the concierge flow and request-detail pages use React inline styles for a dark, premium look — follow the existing pattern within a given file rather than converting wholesale.
- Monetization fields (`hasSponsoredSpot`, `isPremiumSniper`, `publicReleaseDate`) exist in the DB schema and are read by the match engine, but there is no billing/payment integration yet — don't assume a payment layer exists (planned: IfthenPay first, see PROGRESS.md).

## Continuidade de sessão
- No ARRANQUE: lê `PROGRESS.md` por inteiro antes de qualquer ação e resume-me em 2 linhas onde ficámos.
- Ao FECHAR (quando eu disser "wrap" ou correr /wrapup): atualiza `PROGRESS.md` — estado atual, próximos passos priorizados, decisões novas.
- Remove passos já feitos. Mantém <40 linhas. Não apagues decisões importantes; move o obsoleto para o fim.