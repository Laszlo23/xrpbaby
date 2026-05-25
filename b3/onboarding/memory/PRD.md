# Building Culture — Landing Page PRD

## Original Problem Statement
Create a world-class, cinematic, story-driven landing page for **Building Culture** — a movement to fund, build, own and experience real-world communities. Mix of Apple / Stripe / Airbnb / Notion / Linear / Modern Web3 / Architectural storytelling. Mobile-first, dark mode, premium typography, glassmorphism, cinematic scroll.

## Target Audience
Community members · Home seekers · Investors · Builders · Entrepreneurs · Property owners · Web3 + Web2 users

## Core Requirements (static)
- 10-section single-page narrative (Hero → Problem → Vision → Ecosystem → Culture Layer → BCD → Impact → Investors → Future → Final CTA)
- Dark obsidian base + sage/copper + cyan/lime accents
- Cabinet Grotesk display + Manrope body + JetBrains Mono labels
- Cinematic scroll (Framer Motion), glass-morphism, noise overlays
- Mobile-first, fully responsive
- All 8 ecosystem products as interactive cards with beta/live/coming-soon badges and external link behavior
- Waitlist form (email capture → MongoDB)
- Lightweight analytics events

## Architecture
- **Frontend:** React (CRA + craco) · TailwindCSS · Framer Motion · Lucide React · Shadcn UI base
- **Backend:** FastAPI · Motor (Mongo async) · Pydantic v2
- **DB:** MongoDB collections: `waitlist`, `analytics`
- **Static data:** Ecosystem list (8 products) hardcoded on server

## API Surface
- `GET  /api/` health
- `GET  /api/ecosystem` 8 products
- `POST /api/waitlist` idempotent on email
- `GET  /api/waitlist/count`
- `POST /api/analytics`
- `GET  /api/stats`

## What's been implemented (2025-12)
- ✅ All 10 sections built, animated, mobile-responsive
- ✅ Cinematic hero with before/after building reveal slider (auto-animated)
- ✅ Ecosystem bento with 8 products fetched from backend
- ✅ BCD orbiting token visualization
- ✅ Waitlist form with success state + idempotent backend
- ✅ Analytics tracking on key interactions
- ✅ AI-generated imagery (Gemini Nano Banana) for hero/problem/impact/investor visuals
- ✅ Tested: 100% backend, 95% frontend, no critical issues

## Prioritized Backlog
- **P1:** Real before/after parallax with scroll-driven scrub
- **P1:** Investor "Request Deck" route with calendar booking (Calendly)
- **P2:** Lenis smooth-scroll integration
- **P2:** Per-product detail modal with case studies
- **P2:** i18n (DE/EN) — Vienna/Austria-first audience
- **P2:** Connect waitlist to email service (Resend / SendGrid) for confirmation email
- **P3:** Real metrics dashboard from real BC data sources

## Next Tasks
- Wire real CTA destination URLs (Telegram/Discord) when client provides
- Hook waitlist to transactional email provider for double-opt-in
- Replace mock stats with real community/property data when available
