# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is this

Needer is an AI-powered concierge marketplace (reverse marketplace): a user describes a need in natural language, the AI categorizes it and matches professionals, and pros pitch to the buyer (buyer has the power, not the searcher). See `NEEDER_PROJECT_BIBLE.md` for the full product/architecture spec — read it before making non-trivial changes, it is the source of truth for this project.

## Commands

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # eslint
```

There is no test suite configured in this repo.

## Environment

`.env` requires `MONGODB_URI`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, and optionally `OPENAI_API_KEY`. MongoDB is Atlas-hosted — the local machine's IP must be whitelisted or connections fail with `ENOTFOUND`.

## Architecture

- Next.js App Router, all pages live under `src/app/[locale]/` — every route is locale-aware via `next-intl` (`en`/`pt`). API routes live under `src/app/api/` and are not locale-prefixed.
- `src/proxy.ts` is the routing middleware (Next.js 16 renamed the `middleware.ts` convention to `proxy.ts`) — it wraps `next-intl`'s middleware and matches all paths except API/static routes.
- MongoDB via Mongoose. Models are in `src/lib/models/` (`User`, `Request`, `Proposal`, `Notification`, `Message`, `ProposalDraft`). Connection is a cached singleton in `src/lib/db.ts`.
- Auth is NextAuth Credentials + JWT (30-day sessions). Session carries `id`, `name`, `email`, `role`, `isVerified`. Changing a user's `role` in the DB requires them to log out/in since it's baked into the JWT.
- The core product logic is the AI match engine at `src/app/api/ai-match/route.ts`: categorizes the query, finds/ranks pros (sponsored slot first, then organic by rating), falls back to a hardcoded mock pro roster per category if no real pros exist, and persists the request. Without `OPENAI_API_KEY` it uses a keyword-based mock categorizer (`mockCategorize()`) instead of calling GPT-4o-mini — this is the normal/expected dev mode.
- Mock proposal injection: when mock pros are used, the system upserts them as real `User` documents (emails like `*@mock.needer.com`) 3–10s after a match, so `Proposal` documents can reference valid ObjectIds. Don't assume mock pro IDs (e.g. `'mock-plumb-1'`) are valid ObjectIds anywhere else — they only become real after upsert.
- Categories (12, each with 2–4 subcategories, EN/PT labels) are defined centrally in `src/lib/categories.ts` — this is the single place category taxonomy changes.
- Next.js 16: `params` in route handlers is a Promise — must `await params` before destructuring.

## Conventions

- i18n: all user-facing text must have both EN and PT variants. Older/core components use `next-intl` message keys (`messages/en.json`, `messages/pt.json`); most newer feature code instead inlines `locale === 'pt' ? 'PT text' : 'EN text'` — match whichever pattern the file you're editing already uses.
- Styling is mixed: most of the app uses Tailwind CSS, but the concierge flow and request-detail pages use React inline styles for a dark, premium look — follow the existing pattern within a given file rather than converting wholesale.
- Monetization fields (`hasSponsoredSpot`, `isPremiumSniper`, `publicReleaseDate`) exist in the DB schema and are read by the match engine, but there is no billing/payment integration yet — don't assume a Stripe layer exists.
