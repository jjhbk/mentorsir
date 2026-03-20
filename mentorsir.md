# MentorSir — System Overview

**Last updated:** March 2026  
**Version:** 1.0  
**Tagline:** Smart Structure. Right Guidance. Confident Prelims.

---

## 1. What is MentorSir?

MentorSir is a UPSC mentorship platform built around two flagship programs:

- **PTP 2.0** — Prelims Training Program (active enrollment, target: UPSC Prelims 2026)
- **MTP 2.0** — Mains Training Program (runs post-Prelims clearance)

The core value proposition is structured, honest, student-first mentorship — not just content delivery. The platform deliberately positions itself against inflated coaching claims through a combination of personalized guidance, psychological support, and accountability systems.

---

## 2. Programs

### 2.1 PTP 2.0 — Prelims Training Program

**Target audience:** UPSC aspirants preparing for Prelims 2026 (first attempt or repeat)

**Three content pillars:**

| Pillar | Description |
|---|---|
| General Studies (GS) | PYQ-first, concept-driven coverage; daily/weekly MCQs with detailed explanations; static + current integration |
| CSAT | Taught by IIT & IIM graduates; aptitude, reasoning & comprehension; special support for non-maths students |
| Current Affairs (1.5 Years) | Prelims-oriented coverage; monthly + thematic linkage to static GS; concise notes + revision plans |

**Mentorship layer:**
- Personal study planning and performance review
- Exam stress & mindset counselling (Rohit Sir, IIT Roorkee + certified counsellor)
- Accountability, honest feedback, and course correction

**Pricing:**
- Previous batch students: ₹5,999
- New students: ₹6,999
- (Original individual module price: ₹24,997 — 72% discount)

---

### 2.2 MTP 2.0 — Mains Training Program

**Target audience:** Students who cleared Prelims (or preparing for Mains 2026)

**Six feature pillars:**
1. Mentorship by selected officers & experienced mentors
2. Answer writing — deliberate practice with workshops (sub-parts, intro/conclusion, diagrams)
3. Daily tracking — reminder calls, live discipline tracker, consistency appreciation
4. Thematic tests — sectional tests, FLTs, personalised feedback
5. Peer group learning — buddy groups of 3, group discussions, peer evaluation
6. Guided meditation — stress management and exam pressure handling

---

## 3. Mentor Team

| Mentor | Background | Role |
|---|---|---|
| Abhishek Tiwari | 2 UPSC Interviews, IIM NIT, TEDx Speaker | GS + CSAT Mentor |
| Abhishek Goswami | 118+ in Prelims, 3 CSE + 2 IFoS Mains | GS Faculty, MCQ Strategy |
| Rohit Patel | IIT Roorkee, CSE & IFoS Mains, Certified Counsellor | UPSC Strategy + Psych Support |
| Wazid Hussain | IIT Roorkee, HPSC Mains, Fitness/Cricket Coach | Mentorship & Evaluation |
| Selected Officers & Retired Bureaucrats | Real-world governance | Ethics, Case Studies |

---

## 4. Mission, Vision & Values

**Mission:** Provide clarity, structure, and honest mentorship that helps UPSC aspirants convert hard work into consistent results.

**Vision:** Build India's most trusted, student-centric UPSC mentorship ecosystem — where no aspirant feels lost, misled, or alone.

**Values:**
- **Integrity** — No inflated claims
- **Student-first** — Approach over profit
- **Consistency & Empathy** — Long-term accountability

---

## 5. Student Intake & Profiling (PTP 2.0)

Students fill a **Mentorship Intake Form** (currently Google Forms) on enrollment. This form captures:

### 5.1 Basic Profile
- Full name, mobile, email
- Medium of instruction (English / Hindi / Other)
- Graduation stream

### 5.2 Prelims Background
- Attempt count
- Previous GS score (NA / <60 / 60–75 / 75–85 / 85+)
- Specific difficulties or personal circumstances

### 5.3 GS Subject Comfort
- Strong subjects (multi-select): Polity, Economy, History, Geography, Environment, Science & Tech, Current Affairs
- Weak subjects (same list)
- Current affairs source type: monthly magazine, newspaper+notes, coaching notes, multiple/inconsistent, not following

### 5.4 CSAT Readiness
- Strong area: Quant / Comprehension / Reasoning-DI
- Weak area (same list)
- CSAT score band: Never tested / Below 60 / 65–80 / 80+ mocks

### 5.5 Test & Practice Behavior
- Mock frequency: Regularly / Sometimes / Never
- Test analysis level: Full / Partial / Just score
- Wrong question revision: Yes regularly / Sometimes / Rarely / Never
- PYQ practice: Full timed / Untimed / Topic-wise / Never seriously

### 5.6 Core Prelims Challenges (multi-select)
Low accuracy, excessive guesswork, poor elimination, silly mistakes, information overload, poor revision, exam anxiety

### 5.7 Study Discipline
- Plan consistency: Consistent / Irregular / No plan
- Daily hours: <4 / 4–6 / 6–8 / 8+
- Revision count per subject: 0–1 / 2 / 3 / 4+ / Unsure
- Sources per subject: 1 / 2 / 3 / 4+ / Keeps changing

### 5.8 Mentorship Expectations (up to 3)
GS+CSAT test series, Test analysis & mistake tracking, Elimination & smart guessing, Accountability & discipline, Motivation & emotional support, Structured daily targets

### 5.9 Discovery Channel
YouTube / Telegram / Instagram / Friends / Google / Other

---

## 6. Platform Architecture (Proposed)

### 6.1 Web App — Landing & Onboarding

**Purpose:** Public-facing conversion funnel + student enrollment flow

**Key pages:**
- **Home/Landing** — Hero section, program overview, social proof, CTA
- **Programs** — PTP 2.0 and MTP 2.0 detailed pages
- **Mentors** — Profiles for all 4+ mentors
- **Testimonials** — Video testimonials + transformation stories
- **Pricing** — Module breakdown, discount, enrollment CTA
- **Onboarding Flow** — Replaces Google Form; captures intake data natively
- **Post-enrollment confirmation** — Welcome page + next steps

**Auth:** Email/phone OTP for new student registration post-payment

---

### 6.2 Mobile App — Day-to-Day Operations

Two-tier login:

#### Tier 1: Student
- Dashboard: daily tasks, study plan, upcoming tests
- Test portal: mock tests, PYQ sets, CSAT practice
- Current affairs feed: daily notes, MCQs, static linkages
- Performance tracker: subject-wise accuracy, mock history, rank in cohort
- Mentor connect: scheduled 1:1 sessions, chat with assigned mentor
- Revision planner: wrong question log, spaced repetition schedule
- Wellbeing corner: guided meditation sessions (Rohit Sir content)
- Notifications: reminder calls, consistency streaks, announcements

#### Tier 2: Mentor
- Student roster: assigned students with intake profiles
- Performance overview: per-student accuracy trends, test scores, revision counts
- Study plan builder: assign/adjust personalized plans
- Accountability tools: mark reminder calls done, flag at-risk students
- Session management: schedule and log 1:1 sessions
- Batch announcements: push notes, MCQs, current affairs to cohort
- Feedback panel: add comments on student test submissions
- Admin view (head mentors only): cross-cohort analytics, enrollment data

---

## 7. Key Data Models

### Student
```
id, name, phone, email, medium, graduation_stream
program: PTP | MTP | both
batch_id, assigned_mentor_id
intake_form: { prelims_experience, gs_score_band, strong_subjects[], weak_subjects[],
               csat_score_band, mock_frequency, test_analysis_level, core_challenges[],
               daily_hours, revision_count, study_consistency, mentorship_expectations[] }
enrollment_date, payment_status
```

### Mentor
```
id, name, phone, role, bio, specialization[]
assigned_students[]
```

### Test
```
id, type: GS | CSAT | CA, subject, difficulty
questions[], time_limit
linked_batch_ids[]
```

### TestAttempt
```
student_id, test_id, timestamp
answers[], score, accuracy
wrong_questions[], analysis_notes
```

### Session
```
id, mentor_id, student_id, scheduled_at, duration
notes, action_items[], status: scheduled | done | missed
```

### StudyPlan
```
student_id, created_by (mentor_id)
daily_targets[]: { date, subjects[], hours, tasks[] }
completion_log[]
```

---

## 8. Content Architecture

```
Content
├── General Studies
│   ├── Polity
│   ├── Economy
│   ├── History (Ancient / Medieval / Modern)
│   ├── Geography (Physical / Indian / World)
│   ├── Environment & Ecology
│   └── Science & Technology
├── CSAT
│   ├── Quantitative Aptitude
│   ├── Comprehension
│   └── Reasoning & Data Interpretation
├── Current Affairs
│   ├── Monthly Compilations (1.5 year backlog)
│   ├── Thematic Linkage Notes (CA → Static GS)
│   └── Daily MCQ Feed
└── Mains (MTP)
    ├── Answer Writing Workshops
    ├── Model Answers (300+)
    └── PYQ Bank (10 years, topic-wise)
```

---

## 9. Communication Channels

| Channel | Use case |
|---|---|
| In-app notifications | Daily reminders, test alerts, streak nudges |
| Mentor reminder calls | Manual accountability calls (logged in app) |
| Telegram (existing) | Community announcements, CA updates |
| YouTube (existing) | Free content, top-of-funnel |
| Instagram (existing) | Brand awareness, testimonials |

---

## 10. Tech Stack Recommendations

### Web App
- **Framework:** Next.js (SSR for SEO on landing pages)
- **Styling:** Tailwind CSS
- **Auth:** Supabase Auth (phone OTP)
- **Payments:** Razorpay or Cashfree (India-native, UPI support)
- **CMS:** Sanity or Notion API for content pages

### Mobile App
- **Framework:** React Native (Expo) — single codebase for iOS + Android
- **State:** Zustand or Redux Toolkit
- **Backend:** Supabase (Postgres + Realtime + Storage)
- **Push notifications:** Expo Notifications + FCM
- **Video:** Mux or Cloudflare Stream for lecture content

### Shared Backend
- **Database:** PostgreSQL (via Supabase)
- **Storage:** Supabase Storage / S3 for PDFs, notes, videos
- **APIs:** REST or tRPC

---

## 11. Build Phases (Suggested)

### Phase 1 — Web (Weeks 1–3)
- Landing page (PTP 2.0 focused)
- Program detail pages
- Mentor profiles
- Pricing + enrollment CTA
- Native intake form (replaces Google Form)
- Razorpay payment integration
- Post-enrollment welcome flow

### Phase 2 — Mobile MVP (Weeks 4–8)
- Student login + dashboard
- Study plan view
- Daily CA feed
- Basic test portal (MCQ engine)
- Performance tracker
- Mentor login + student roster

### Phase 3 — Full Mobile (Weeks 9–14)
- Mentor session scheduling
- In-app messaging (mentor ↔ student)
- Reminder call logging
- Wrong question revision engine
- Meditation content module
- Push notification system
- Admin analytics dashboard

---

## 12. Success Metrics

| Metric | Target |
|---|---|
| Prelims score (PTP students) | 90+ median by exam date |
| Mock test attempt rate | >80% students attempt weekly |
| Mentor session completion | >90% scheduled sessions held |
| Student retention (batch completion) | >85% |
| NPS score | 60+ |
| Enrollment conversion (landing → payment) | >12% |

---

*This document is the single source of truth for the MentorSir platform architecture. All product, design, and engineering decisions should reference this overview.*


cd /home/jjhbk/mentorsir/apps/mobile/android
rm -rf build/generated/autolinking
./gradlew :app:generateAutolinkingPackageList --rerun-tasks
./gradlew :app:generateReactNativeEntryPoint --rerun-tasks
./gradlew :app:compileReleaseJavaWithJavac
