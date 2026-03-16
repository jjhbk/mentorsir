# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MentorSir is a UPSC mentorship platform built as a monorepo with two independent apps:
- **`apps/web`** — Next.js 16 landing site and enrollment flow
- **`apps/mobile`** — React Native 0.84 student and mentor portals

The platform centers on two programs: **PTP 2.0** (Prelims Training, ₹6,999) and **MTP 2.0** (Mains Training). See `mentorsir.md` for full product spec, data models, and 3-phase build roadmap.

## Commands

### Web (`apps/web`)
```bash
npm run dev      # Dev server at localhost:3000
npm run build    # Production build
npm run lint     # ESLint
```

### Mobile (`apps/mobile`)
```bash
npm start              # Metro bundler
npm run android        # Build & run on Android
npm run ios            # Build & run on iOS
npm test               # Jest tests
npm run lint           # ESLint

# iOS only — first-time setup
bundle install
bundle exec pod install
```

## Architecture

### Web
- Next.js App Router (`app/` directory)
- Path alias `@/*` maps to the project root
- Tailwind CSS 4 with CSS variables for dark/light theming in `app/globals.css`
- No backend or authentication implemented yet

### Mobile
- React Native with `react-native-safe-area-context` wrapping the root
- Jest configured with `react-native` preset; tests live in `__tests__/`
- Prettier 2 + ESLint `@react-native` config

### Monorepo
- No root-level package.json — the two apps are fully independent
- No shared packages directory yet; duplication is acceptable until a shared layer is needed

## Student Tracking Data Model (from XLSX)

The XLSX `Student __ mentor_sir.xlsx` is the **operational template** given to each enrolled student. It has 7 sheets that define exactly what the app must track:

### Sheet: Daily Accountability (core tracking)
Columns students fill every day:
- `Date`, `Study hours`, `Sleep hours`, `Meditation (min)`
- `Sleep time (last night)`, `Wake up time (today)`
- `Task Completed` (boolean), `Afternoon Nap (mins)`
- `1-to-1 discussion` (with mentor), `Relaxation activity`

### Sheet: Schedule by mentor|sir (PTP 2.0 study plan)
Weekly cadence the app must enforce:
- Mon–Fri: GS subject study + CSAT daily, Current Affairs 3×/week
- Thursday: Current Affairs Test
- Friday: Sectional Test (GS + CSAT)
- Sunday: Mentor Connect (live session)

Columns: `Date`, `Subject`, `Syllabus`, `Completed Task`, `NOT Completed Task`, `Revision 1st/2nd/3rd done (Yes/No)`, `Primary Source`

### Sheet: Prelims Mistake Analysis (test error tracking)
8 mistake categories to track per test:
1. Conceptual (Knowledge Gap)
2. Recall / Revision
3. Question Reading
4. Elimination
5. Decision-Making
6. Silly / Careless
7. Psychological
8. Pattern Misjudgment

Each test entry records count per category + test name.

### Sheet: Personality & Academic Audit
Two-axis student profile maintained by mentors:
- **Academic Audit**: Strong Subjects / Subjects needing improvement
- **Personality Audit**: Strong Traits / Traits needing improvement

### Sheet: Resource Mapping
Subject → Parts → Resource → PYQ Practice → Mains PYQ mapping (used for mentor-assigned study material recommendations).

### Sheet: Yearly Plan
Monthly subject rotation (Jan–Nov): Modern History → Economy/S&T → Geography/E&E → Ancient/Medieval → Polity → Ethics → Society → IS&DM → Economy → S&T. QUANT runs parallel throughout.

---

## Intake Form Data Model (from PDF — 27 fields)

What the app captures on enrollment:

| Section | Fields |
|---|---|
| Basic Info | Full name, mobile, email, medium (English/Hindi/Other), graduation stream |
| Prelims Background | Experience level (4 options), attempt count, GS score band (NA/<60/60-75/75-85/85+), personal difficulties |
| GS Comfort | Strong subjects (multi-select), Weak subjects — both from: Polity, Economy, History, Geography, Environment, Science & Tech, Current Affairs |
| Current Affairs | Source type: Monthly magazine / Newspaper+notes / Coaching notes / Multiple inconsistent / Not following |
| CSAT | Strong area, Weak area (Quant / Comprehension / Reasoning), CSAT score band (NA/Below 60/65-80/80+) |
| Test Behaviour | Mock frequency, Test analysis depth (Full/Partial/Score only), Wrong question revision habit, PYQ practice style |
| Core Challenges | Low accuracy, Excessive guesswork, Poor elimination, Silly mistakes, Information overload, Poor revision, Exam anxiety |
| Study Discipline | Study plan consistency, Daily study hours (<4/4-6/6-8/8+), Revision count, Sources per subject |
| Mentorship Expectations | GS+CSAT test series / Test analysis & mistake tracking / Elimination techniques / Accountability / Motivation / Structured daily targets |
| Discovery | YouTube / Telegram / Instagram / Referral / Google / Other |

---

## Automation Architecture (from z_automation.pdf)

7 systems to build — priority order matches the 5-week implementation plan:

1. **Lead & Marketing Automation** — Form → DB → WhatsApp welcome → email → counsellor assigned
2. **Student Behaviour Monitoring** — Study hours logged → average computed → deviation triggers mentor alert
3. **Test Participation Monitoring** — Check if test attempted → auto-reminders if skipped
4. **Academic Content Monitoring** — Faculty assignment deadlines + auto-reminders
5. **Payment Automation** — Fee due date tracking → reminder 7 days before + on due date
6. **Student Issue System** — Anonymous/open feedback channel
7. **Founder Dashboard** — Unified real-time metrics

**Communication channels**: WhatsApp API (primary), Email (secondary), in-app notifications.

**Planned external tools** (to integrate or replace with native features): Google Forms, Google Sheets/Airtable, Zapier/Make/n8n, Looker Studio/Notion.

---

## Key Reference Files

- `mentorsir.md` — product spec, mentor profiles, 3-phase build plan
- `Student __ mentor_sir.xlsx` — operational tracking template (defines the DB schema)
- `PTP 2.0 Mentorship Intake Form.pdf` — enrollment form (27 fields, defines student onboarding data)
- `z_automation.pdf` — automation architecture and 5-week build plan
- `about_details.pdf` — program marketing/branding (PTP 2.0 visual identity, pricing, social channels)
