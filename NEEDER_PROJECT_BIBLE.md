# 🧠 NEEDER v2.0 — Project Bible

> **CRITICAL**: Read this ENTIRE document before writing ANY code. This is the single source of truth for the Needer project.

---

## 1. What is Needer?

Needer is an **AI-powered Concierge Marketplace** (Reverse Marketplace). It is NOT a traditional directory or search engine.

**How it works:**
1. The user types a raw need in natural language: *"My bathroom lamp sparked, need an electrician"*
2. The **Needer AI** instantly categorizes the request, determines urgency, and **publishes it to the public feed**
3. Professionals receive the request and **pitch to the buyer** (reverse marketplace — buyer has the power)
4. The buyer reviews proposals, accepts one, the job happens, and then they leave a review

**Key differentiator:** The buyer never searches, browses, or filters a list of professionals. They describe what they need; the AI files it; the pros come to them.

**What is on display is demand, not supply.** The homepage feed and the search bar both search *open requests* — what other people need right now. Professionals scan that feed for work to bid on. An earlier version of `ai-match` returned ranked pro cards; it was removed on purpose on 2026-08-16 because it made Needer a directory, which is the exact dynamic this marketplace exists to invert. Do not reintroduce pro search, pro ranking, or a pro directory.

---

## 2. Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.2.4 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | MongoDB (via Mongoose) | 9.2.4 |
| Authentication | NextAuth.js (Credentials) | 4.24.13 |
| i18n | next-intl | 4.8.3 |
| Icons | lucide-react | 0.577.0 |
| Animations | framer-motion | 12.35.1 |
| Password Hashing | bcryptjs | 3.0.3 |

**Run locally:** `npm run dev` → http://localhost:3000

**Environment variables** (`.env`):
```
MONGODB_URI=<Atlas connection string>
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=http://localhost:3000
UPLOADTHING_TOKEN=<uploadthing v7 token>
```
See `.env.example` for the full, commented list. Never commit real values — this repo is public.

---

## 3. Internationalization (i18n)

The app supports **English (en)** and **Portuguese (pt)**.

- Translation files: `messages/en.json` and `messages/pt.json`
- Routing: `/en/concierge`, `/pt/concierge`
- Config: `src/i18n/routing.ts`, `src/i18n/navigation.ts`, `src/i18n/request.ts`
- In components: `useLocale()` returns `'en'` or `'pt'`, then use ternary: `locale === 'pt' ? 'Texto PT' : 'Text EN'`

**⚠️ IMPORTANT RULE:** ALL user-facing text must use the locale system. Never mix languages. Every string must have both PT and EN variants.

---

## 4. Project Structure

```
e:\Needer.com\all-market\
├── messages/                    ← Translation JSON files (en.json, pt.json)
├── src/
│   ├── app/
│   │   ├── [locale]/            ← All pages (locale-aware routing)
│   │   │   ├── page.tsx         ← Homepage
│   │   │   ├── layout.tsx       ← Root layout (Navbar, Footer, providers)
│   │   │   ├── auth/
│   │   │   │   ├── login/       ← Login page
│   │   │   │   └── register/    ← Registration page
│   │   │   ├── concierge/       ← Free-text shortcut that pre-fills requests/new
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx     ← Router (redirects to /client or /pro)
│   │   │   │   ├── client/      ← Client dashboard (My Jobs)
│   │   │   │   └── pro/         ← Pro dashboard (Opportunities feed + real stats)
│   │   │   │       ├── onboarding/ ← ⭐ Pro onboarding wizard (3-step)
│   │   │   │       ├── drafts/  ← Proposal draft templates
│   │   │   │       └── verify/  ← Pro verification flow
│   │   │   ├── requests/[id]/   ← Request detail + proposals inbox
│   │   │   ├── users/[id]/      ← Public pro profile page
│   │   │   ├── settings/        ← User settings (theme toggle, etc.)
│   │   │   ├── messages/        ← Messaging (placeholder)
│   │   │   ├── pro/             ← Pro landing page
│   │   │   └── profile/         ← User's own profile
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── [...nextauth]/ ← NextAuth config (JWT, credentials)
│   │       │   └── register/    ← POST: User registration
│   │       ├── requests/
│   │       │   ├── route.ts     ← GET: List requests, POST: Create request
│   │       │   └── [id]/
│   │       │       └── route.ts ← GET: Single request, PATCH: Mark complete
│   │       ├── proposals/
│   │       │   ├── route.ts     ← GET: List proposals, POST: Submit proposal
│   │       │   └── [id]/
│   │       │       └── route.ts ← PUT: Accept/reject proposal
│   │       ├── users/
│   │       │   └── [id]/
│   │       │       ├── route.ts ← GET: Public user profile
│   │       │       ├── profile/
│   │       │       │   └── route.ts ← PATCH: Update profile (onboarding)
│   │       │       └── review/
│   │       │           └── route.ts ← POST: Submit review + update rating
│   │       ├── notifications/   ← GET: Fetch, PATCH: Mark read
│   │       ├── messages/        ← Messaging API
│   │       ├── drafts/          ← Proposal draft templates API
│   │       └── verified/        ← Verification status API
│   ├── components/
│   │   ├── features/            ← Business components
│   │   │   ├── HeroSection.tsx
│   │   │   ├── PopularCategories.tsx
│   │   │   ├── CategoryCard.tsx
│   │   │   ├── CategoryScrollBar.tsx
│   │   │   ├── SimpleCategoryGrid.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── NeederPro.tsx
│   │   │   └── PreFooterCTA.tsx
│   │   ├── layout/              ← Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── CategoryBar.tsx
│   │   │   ├── NotificationBell.tsx  ← Polls /api/notifications every 30s
│   │   │   └── PreferencesModal.tsx
│   │   └── ui/                  ← Reusable UI primitives
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Badge.tsx
│   │       └── Input.tsx
│   ├── i18n/                    ← Internationalization config
│   │   ├── navigation.ts
│   │   ├── routing.ts
│   │   └── request.ts
│   └── lib/
│       ├── db.ts                ← MongoDB connection (cached, singleton)
│       ├── categories.ts        ← Category definitions (12 categories, EN/PT)
│       ├── notifications.ts     ← createNotification() helper
│       └── models/
│           ├── User.ts          ← User schema (client/pro roles)
│           ├── Request.ts       ← Service/product request schema
│           ├── Proposal.ts      ← Pro proposal schema
│           ├── Notification.ts  ← Notification schema
│           ├── Message.ts       ← Chat message schema
│           └── ProposalDraft.ts ← Proposal template schema
```

---

## 5. Database Models (MongoDB/Mongoose)

### User
```
name, email, password (hashed), role ('client'|'pro'),
isVerified, location {type, coordinates}, locationLabel,
avatar, bio, phone, proCategory, skills[],
ratings[{ userId, score (1-5), comment, createdAt }],
rating (aggregate, auto-calculated),
hasSponsoredSpot (monetization), isPremiumSniper (monetization),
verificationStatus ('none'|'pending'|'approved'|'rejected'),
verificationData { businessName, taxId, website, submittedAt }
```

### Request
```
title, description, category, subcategory,
budget, fixedPrice, type ('service'|'product'),
location, locationLabel, status ('open'|'accepted'|'in_progress'|'closed'),
urgency ('Normal'|'High'|'Urgent'), aiTags[],
publicReleaseDate (Sniper Bidding: +1h from creation),
intentConfirmed, userId (ref User), acceptedByProId (ref User),
isFeatured, itemCondition, acceptsTrades
```

### Proposal
```
requestId (ref Request), proId (ref User),
message, price, status ('pending'|'accepted'|'rejected')
```

### Notification
```
userId (ref User),
type ('new_proposal'|'proposal_accepted'|'proposal_rejected'|'new_message'|'request_closed'|'new_review'|'system'),
content, readStatus, relatedId
```

---

## 6. Request intake (rewritten 2026-10-12)

There is **one** way a request is saved: `POST /api/requests`, fed by the form at `/[locale]/requests/new` (category → details + photos + urgency → price + district → confirm).

The concierge (`/[locale]/concierge`) is a shortcut into that form, not a second publisher: the client types a sentence, `categorize()` (`src/lib/categorize.ts`, keyword rules, runs in the browser, no LLM) extracts category, subcategory, district, urgency and budget, and the form opens pre-filled for the client to check and complete. Anything not recognised is left blank for the client to choose — never defaulted (the old engine filed unknown cities as "Porto" and unknown trades under a non-existent `general` subcategory).

On creation, `notifyMatchingPros()` notifies every pro whose `proCategory` matches the subcategory or category.

The old `/api/ai-match` route, which saved requests directly and **fabricated proposals from fake "mock" pros** when a category had no real pros, was deleted: fake proposals shown to real users are not acceptable in a live product.

Location is the **district** (`src/lib/districts.ts`), plus an optional free-text town. No street addresses are collected.

---

## 7. Monetization Model (Designed, Not Yet Implemented)

| Revenue Stream | How it works |
|----------------|-------------|
| **Sponsored AI Match** | Pro pays for priority placement. Quality gate: must have rating ≥ 4.5. **⚠️ Homeless since 2026-08-16** — its only rendering surface was the deleted pro-card list; `hasSponsoredSpot` is still read by the code but is currently displayed nowhere. Needs a new surface (e.g. ranking inside a request's proposal list) before billing ships. |
| **Sniper Bidding** | Product sellers pay for 1-hour early access to new requests before they go public |
| **Commission** | Future: % cut on accepted proposals |

These fields exist in the DB (`hasSponsoredSpot`, `isPremiumSniper`, `publicReleaseDate`) but the payment/billing integration is not built yet.

---

## 8. Authentication

- **Provider:** Credentials (email + password)
- **Strategy:** JWT (30-day sessions)
- **Session fields:** `id`, `name`, `email`, `role`, `isVerified`
- **Registration API** already accepts `role: 'pro'` — creates pro accounts
- **Pages:** `/auth/login`, `/auth/register`

---

## 9. Categories (12 total)

| Key | EN | PT | Type |
|-----|----|----|------|
| home-repairs | Home Repairs (incl. Locksmiths/Serralheiros) | Reparações Domésticas | service |
| tech-digital | Tech & Digital | Tecnologia e Digital | service |
| tutoring | Tutoring & Languages | Explicações e Línguas | service |
| events | Events & Parties | Eventos e Festas | service |
| wellness | Wellness & Sports | Bem-estar e Desporto | service |
| equipment | Buy Equipment | Compra de Equipamentos | product |
| business | Business & Consulting | Negócios e Consultoria | service |
| design | Design & Creative | Design e Criatividade | service |
| writing | Writing | Escrita | service |
| cleaning | Cleaning Services | Serviços de Limpeza | service |
| automotive | Automotive Services | Serviços Automóveis | service |
| beauty | Beauty & Personal Care | Estética e Cuidado Pessoal | service |

Each has 2-4 subcategories with EN/PT labels. Defined in `src/lib/categories.ts`.

---

## 10. What Has Been Built (Complete ✅)

### Phase 1: The Cliff Fix
Fixed the dead-end after intake. The user now flows seamlessly from posting a request to job confirmation.

| Feature | Files | What it does |
|---------|-------|-------------|
| **Concierge** | `concierge/page.tsx` | Type a need → opens the request form pre-filled (since 2026-10-12) |
| **Pro Profile** | `users/[id]/page.tsx` | Premium trust page: bio, stats, reviews, skills, CTA |
| **Confirmation** | `requests/new/page.tsx` | Request is published from the form's confirm step |
| **Proposals Inbox** | `requests/[id]/page.tsx` | See incoming proposals, accept/reject, 15s auto-polling |
| ~~Mock Injection~~ | removed 2026-10-12 | Used to fabricate proposals from fake pros — deleted before launch |
| **Request API** | `api/requests/[id]/route.ts` | GET single request, PATCH mark complete |
| **Proposal API** | `api/proposals/[id]/route.ts` | PUT accept/reject with notifications |

### Phase 2: Complete Journey
Added the post-acceptance lifecycle.

| Feature | Files | What it does |
|---------|-------|-------------|
| **Mark Complete** | `requests/[id]/page.tsx` + `api/requests/[id]/route.ts` | Owner clicks "Mark as Complete" → status: closed |
| **Review Form** | `requests/[id]/page.tsx` | Star selector (1-5) + comment after job closes |
| **Review API** | `api/users/[id]/review/route.ts` | Pushes review to User.ratings[], recalculates aggregate |
| **Notifications** | `NotificationBell.tsx`, `Notification.ts`, `notifications.ts` | Bell polls every 30s, fires on all key lifecycle events |

### The Complete User Loop (Verified End-to-End):
```
Post "I need a plumber" → AI categorizes and publishes it → Green confirmation
→ "View request & proposals" → Proposals arrive (3-10s)
→ Accept one → "Professional Assigned!" + "Mark as Complete" button
→ Click complete → "Job Complete!" + Review form
→ Rate 4/5 + comment → "Review submitted!" → Rating updates on pro profile
```

### Phase 3: The Pro Side
Made professionals real participants instead of mock data.

| Feature | Files | What it does |
|---------|-------|-------------|
| **Pro Registration** | `auth/register/page.tsx` | Role toggle: "I need help" / "I'm a professional" with visual selector |
| **Pro Onboarding** | `dashboard/pro/onboarding/page.tsx` | 3-step wizard: choose category → select skills → write bio + location |
| **Profile Update API** | `api/users/[id]/profile/route.ts` | **[NEW]** PATCH endpoint to save profile fields (bio, skills, proCategory, location) |
| **Pro Dashboard** | `dashboard/pro/page.tsx` | Real stats (proposals sent, accepted, rate), category-matched opportunities, onboarding nudge |
| **Pro Stats API** | `api/proposals/stats/route.ts` | **[NEW]** GET endpoint returning pro-specific metrics |
| **Proposal Submission** | `requests/[id]/page.tsx` | Pros see a pitch form (message + price) on open requests, with confirmation and duplicate check |

---

## 11. What Already Exists But Needs Work

| Feature | Location | Status |
|---------|----------|--------|
| **Client Dashboard** | `dashboard/client/page.tsx` | Exists — lists user's requests. Basic but functional |
| **Settings Page** | `settings/page.tsx` | Exists — theme toggle, language switch |
| **Messaging** | `messages/page.tsx` + `api/messages/` | Routes exist but UI is minimal |
| **Pro Verification** | `dashboard/pro/verify/` + `api/verified/` | Form exists to submit business info |
| **Draft Templates** | `dashboard/pro/drafts/` + `api/drafts/` | Pro can save proposal templates |
| **Pro Landing** | `pro/page.tsx` | "Become a Professional" landing page |

---

## 12. What Needs to Be Built (Phase 4+)

### Phase 3: The Pro Side ✅ COMPLETE

### Phase 4: Real AI — DROPPED (2026-09-13)
The Gemini integration was built, ran live, and was then removed at the owner's
request along with the AI proposal comparison. Categorization stays keyword-based.
Don't reintroduce an LLM here without asking.

### Phase 5: Payment & Billing
- Stripe integration for proposal payments
- Commission model
- Sponsored spot purchases

### Phase 6: Production Polish
- Real-time notifications (WebSocket/SSE instead of polling)
- Image uploads for pro portfolios
- Mobile responsiveness audit
- SEO optimization
- Error boundary components
- Rate limiting on API routes

---

## 13. Key Design Decisions

1. **Dark theme by default** — the concierge page uses a dark, premium aesthetic
2. **Inline styles** — most components use React inline styles (not Tailwind classes), especially the concierge and request detail pages
3. **No fake activity** — the mock-proposal system was removed on 2026-10-12; an empty request shows an honest empty state, never fabricated proposals
5. **Locale via ternary** — most components use `locale === 'pt' ? 'PT text' : 'EN text'` instead of translation keys for new features

---

## 14. Known Issues & Gotchas

1. **MongoDB Atlas IP whitelist** — your local IP must be whitelisted in MongoDB Atlas or connections fail with `ENOTFOUND`
2. **Next.js 16 params** — `params` in route handlers is a Promise and must be `await`ed: `const { id } = await params`
3. **Leftover mock data** — `*@mock.needer.com` users and their proposals still exist in the dev DB and are scheduled for cleanup
4. **Session role** — the `role` field is in the JWT token. If you change a user's role in the DB, they need to log out and back in
5. **No LLM in the intake path** — categorization is keyword-based by design since 2026-09-13. `GEMINI_API_KEY` is no longer read anywhere.

---

## 15. How to Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
http://localhost:3000
```

Test-account credentials are kept out of this file on purpose — the repo is public.

---

## 16. Summary

**Needer is an AI-first marketplace where buyers describe what they need and professionals compete to serve them.** Both sides of the marketplace are now functional:
- **Client side** (Phase 1+2): post → publish → proposals → accept → complete → review ✅
- **Pro side** (Phase 3): register as pro → onboarding wizard → dashboard with real stats → submit proposals on open requests ✅

The next steps are Phase 5 (Stripe payments) and Phase 6 (production polish). Phase 4 (real AI) was dropped.
