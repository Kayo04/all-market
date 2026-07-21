# 🧠 NEEDER v2.0 — Project Bible

> **CRITICAL**: Read this ENTIRE document before writing ANY code. This is the single source of truth for the Needer project.

---

## 1. What is Needer?

Needer is an **AI-powered Concierge Marketplace** (Reverse Marketplace). It is NOT a traditional directory or search engine.

**How it works:**
1. The user types a raw need in natural language: *"My bathroom lamp sparked, need an electrician"*
2. The **Needer AI** instantly categorizes the request, determines urgency, and finds matching professionals
3. Professionals receive the request and **pitch to the buyer** (reverse marketplace — buyer has the power)
4. The buyer reviews proposals, accepts one, the job happens, and then they leave a review

**Key differentiator:** Users never search, browse, or fill forms. They just describe what they need and the AI handles everything.

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
MONGODB_URI=mongodb+srv://...@cluster0.5b2kgy4.mongodb.net/allmarket
NEXTAUTH_SECRET=<secret>
NEXTAUTH_URL=http://localhost:3000
GEMINI_API_KEY=<optional — enables real AI categorization, free tier, no billing required>
```

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
│   │   │   ├── concierge/       ← ⭐ AI Concierge page (main feature)
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
│   │       ├── ai-match/        ← ⭐ POST: AI categorization + pro matching
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

## 6. The AI Match Engine (`/api/ai-match`)

This is the **core of the product**. It has two modes:

### Mode 1: Mock (default — no GEMINI_API_KEY)
A keyword-based router (`mockCategorize()`) that pattern-matches the user query to categories. Works for demo/dev without any API key.

### Mode 2: Live AI (when GEMINI_API_KEY is set)
Calls Gemini (`gemini-2.0-flash`) with a structured system prompt. Falls back to mock on any error. Gemini was chosen over OpenAI because its free tier requires no billing/payment method.

### The matching flow:
1. **Categorize** the query → `{ category, subcategory, urgency, budget, city, tags }`
2. **Find pros** in DB: Slot 1 = Sponsored (hasSponsoredSpot + rating ≥ 4.5), Slots 2-3 = Organic (best rated)
3. **Fallback** if no real pros exist → serve mock roster (hardcoded demo pros per category)
4. **Persist request** to DB if user is logged in
5. **Inject mock proposals** (3-10s delay) if using mock pros → creates real User docs + Proposal docs in DB

### Mock Pro Roster Categories:
electricians, plumbers, painters, locksmiths, house-cleaning, office-cleaning, websites, mechanic, personal-trainers + a generic fallback

---

## 7. Monetization Model (Designed, Not Yet Implemented)

| Revenue Stream | How it works |
|----------------|-------------|
| **Sponsored AI Match** | Pro pays to always appear as Slot #1 in AI results. Quality gate: must have rating ≥ 4.5 |
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
| home-repairs | Home Repairs | Reparações Domésticas | service |
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
Fixed the dead-end after AI matching. The user now flows seamlessly from search to job confirmation.

| Feature | Files | What it does |
|---------|-------|-------------|
| **AI Concierge** | `concierge/page.tsx` | Chat-like interface, type need → get pro cards |
| **Pro Profile** | `users/[id]/page.tsx` | Premium trust page: bio, stats, reviews, skills, CTA |
| **Confirmation** | `concierge/page.tsx` | Green "Request posted!" banner after match |
| **Proposals Inbox** | `requests/[id]/page.tsx` | See incoming proposals, accept/reject, 15s auto-polling |
| **Mock Injection** | `api/ai-match/route.ts` | Auto-creates fake proposals 3-10s after match for demo |
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
Search "I need a plumber" → AI matches 3 pros → Green confirmation
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

### Phase 4: Real AI (NEXT)
- Add `GEMINI_API_KEY` to `.env`
- The code already has the full Gemini integration (`geminiCategorize()` function, using the free-tier `gemini-2.0-flash` model — no billing required)
- Just needs the key — everything else is wired

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
3. **Mock-first development** — every feature works with mock data before needing real DB content
4. **Mock pros auto-upsert** — when mock proposals are injected, the mock pros are created as real User documents in MongoDB (with `@mock.needer.com` emails) so ObjectId references work
5. **Locale via ternary** — most components use `locale === 'pt' ? 'PT text' : 'EN text'` instead of translation keys for new features

---

## 14. Known Issues & Gotchas

1. **MongoDB Atlas IP whitelist** — your local IP must be whitelisted in MongoDB Atlas or connections fail with `ENOTFOUND`
2. **Next.js 16 params** — `params` in route handlers is a Promise and must be `await`ed: `const { id } = await params`
3. **Mock ObjectIds** — mock pro IDs like `'mock-plumb-1'` are strings, not valid ObjectIds. The injection system now upserts them as real users first
4. **Session role** — the `role` field is in the JWT token. If you change a user's role in the DB, they need to log out and back in
5. **No Gemini key** — without `GEMINI_API_KEY` in `.env`, the AI match uses the keyword-based mock categorizer. This is fine for development

---

## 15. How to Run

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open in browser
http://localhost:3000

# Test accounts (created during testing):
# Email: testflow@needer.com / Password: Test1234!
```

---

## 16. Summary

**Needer is an AI-first marketplace where buyers describe what they need and professionals compete to serve them.** Both sides of the marketplace are now functional:
- **Client side** (Phase 1+2): search → match → proposals → accept → complete → review ✅
- **Pro side** (Phase 3): register as pro → onboarding wizard → dashboard with real stats → submit proposals on open requests ✅

The next steps are Phase 4 (real Gemini integration), Phase 5 (Stripe payments), and Phase 6 (production polish).

### Test Accounts
- **Client:** `testflow@needer.com` / `Test1234!`
- **Pro:** `carlos.pro@test.com` / `Test1234!`
