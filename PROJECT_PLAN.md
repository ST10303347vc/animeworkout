# 🔥 Project Limit Break — Full Project Plan

> *"Where users don't just log reps — they gain XP."*

An anime-themed, gamified workout platform built with React, Tailwind CSS, Framer Motion, and Supabase. Designed web-first with a clear path to React Native mobile.

---

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Framework** | React 19 + TypeScript | Type safety; 1:1 migration to React Native |
| **Build** | Vite 6 | Sub-second HMR, tiny bundles |
| **Styling** | Tailwind CSS v4 + custom anime CSS | Utility-first + hand-crafted glow/particle effects |
| **Animation** | Framer Motion 12 | Declarative animations, gestures, exit transitions |
| **Routing** | React Router v7 | Nested layouts, protected routes |
| **State** | Zustand | < 1 kB, no boilerplate — perfect for HP/XP slices |
| **Backend** | Supabase (Postgres + Auth + Storage) | Auth, RLS, file storage, zero-ops |
| **Sound** | Howler.js | Cross-browser audio sprites |
| **Charts** | Recharts | React-compatible, works in React Native too |
| **DnD** | @dnd-kit | Accessible drag-and-drop for Workout Builder |
| **Testing** | Vitest + RTL + Playwright | Unit → Component → E2E |

---

## Database Schema

```
profiles         → id, display_name, avatar_url, sensei_id, level, total_xp,
                    current_streak, longest_streak, last_workout_date
exercises        → id, name, muscle_group, type (calisthenics|gym),
                    difficulty_rank (E..S), description, demo_url
workouts         → id, user_id, name, is_custom, created_at
workout_exercises→ id, workout_id, exercise_id, sets, reps, order
sessions         → id, user_id, workout_id, started_at, finished_at, total_xp_earned
session_sets     → id, session_id, exercise_id, set_number, reps_completed,
                    weight_kg, completed_at
daily_quests     → id, user_id, date, quest_description, is_completed
achievements     → id, name, description, icon_url, xp_reward,
                    condition_type, condition_value
user_achievements→ user_id, achievement_id, unlocked_at
```

---

## XP & Leveling Formula

```
XP per set  = 10 × difficultyMultiplier × (1 + streakBonus)

Difficulty multipliers:
  E=1.0  D=1.2  C=1.5  B=2.0  A=2.5  S=3.0

Streak bonus: +5% per consecutive day (capped at 50%)

XP to reach level N: 100 × N^1.5
  Level 2  = 283 XP
  Level 5  = 1,118 XP
  Level 10 = 3,162 XP
  Level 20 = 8,944 XP
```

---

## Phase 1: The Training Arc (Foundation)

**Milestone:** User can sign up → pick a Sensei → see the HUD → complete a workout.

### Tasks

| # | Task | Details |
|---|---|---|
| 1.1 | **Project scaffolding** | Vite + React + TS + Tailwind v4 + core deps |
| 1.2 | **Design system** | Color tokens, anime glow utilities, neon-text, custom fonts |
| 1.3 | **Supabase setup** | Create project, initial migration SQL, seed exercise data |
| 1.4 | **Auth flow** | Sign-up / Login page with animated background, `useAuth` hook, protected routes |
| 1.5 | **Sensei selection** | Grid of your vector characters, hover glow, writes to `profiles.sensei_id` |
| 1.6 | **HUD Dashboard** | Power Level ring, Daily Quests panel, quick-start buttons, Sensei avatar |
| 1.7 | **Core Workout Engine** | Session page: exercise → "Complete Set" → progress bar → summary modal |
| 1.8 | **Exercise seed data** | ~60 exercises (calisthenics + gym), tagged by muscle group & rank |
| 1.9 | **Calisthenics ↔ Gym toggle** | Neon-styled toggle switch that filters exercises everywhere |

### Key Components

- `AuthPage.tsx` — animated sign-up/login
- `SelectSenseiPage.tsx` — character grid with Framer Motion hover effects
- `DashboardPage.tsx` — the main HUD
- `PowerLevelRing.tsx` — SVG circular XP progress with glow
- `DailyQuestCard.tsx` — quest + checkbox + XP badge
- `WorkoutSessionPage.tsx` — session runner
- `ExerciseCard.tsx` — exercise info card with set counter
- `ModeToggle.tsx` — calisthenics/gym switch

---

## Phase 2: Power Scaling (Gamification & Customization)

**Milestone:** Users earn XP, level up with "Limit Break" animation, build custom routines.

### Tasks

| # | Task | Details |
|---|---|---|
| 2.1 | **XP & Leveling system** | Pure `xp.ts` functions, Zustand integration, DB sync |
| 2.2 | **Limit Break animation** | Full-screen Framer Motion overlay on level-up (flash → Sensei zoom → text slam) |
| 2.3 | **Difficulty tiers UI** | Color-coded rank badges (E=grey → S=gold shimmer) |
| 2.4 | **Custom Workout Builder** | Drag-and-drop (@dnd-kit), exercise picker drawer, name & save routines |
| 2.5 | **Rest Timer** | SVG circular countdown, aura pulse, color shift blue→red, SFX ding |
| 2.6 | **Streak tracking** | DB columns, flame icon with intensity animation, bonus multiplier |
| 2.7 | **Achievement / Badge system** | DB tables, condition evaluator, slide-in toast notifications |

### Key Components

- `xp.ts` — formulas (pure, testable, shareable with React Native)
- `LimitBreakOverlay.tsx` — cinematic level-up sequence
- `RankBadge.tsx` — E→S rank display
- `WorkoutBuilderPage.tsx` — drag-and-drop routine editor
- `ExercisePickerDrawer.tsx` — slide-out exercise browser
- `RoutineList.tsx` — sortable exercise list
- `RestTimer.tsx` — animated countdown with aura effects
- `StreakFlame.tsx` — flame icon component
- `AchievementToast.tsx` — slide-in badge notification

---

## Phase 3: The Grand Tournament (Advanced Features)

**Milestone:** Skill trees, PB celebrations, battle log, full analytics, sound effects.

### Tasks

| # | Task | Details |
|---|---|---|
| 3.1 | **Calisthenics Skill Trees** | Visual node graph (Push-up → Planche), milestone-based unlocks |
| 3.2 | **Personal Best celebrations** | Compare vs. history; trigger particle burst + glow filter on PB |
| 3.3 | **Battle Log** | Manga-panel styled workout history, paginated, filterable |
| 3.4 | **Analytics Dashboard** | Recharts: XP over time, volume radar, frequency heatmap, strength lines |
| 3.5 | **SFX integration** | Howler.js audio sprites, global mute toggle, 5+ sound events |
| 3.6 | **Social sharing** | Canvas-generated share cards + Web Share API |

### Key Components

- `SkillTreePage.tsx` — interactive node graph
- `progressionTrees.ts` — skill tree data
- `ParticleBurst.tsx` — canvas/CSS particle explosion
- `BattleLogPage.tsx` — manga-style history
- `AnalyticsPage.tsx` — full chart dashboard
- `sfx.ts` — audio manager
- `ShareCard.tsx` — shareable achievement images

---

## Phase 4: Ascension (Mobile Expansion)

**Milestone:** Full-featured apps on iOS and Android.

### Tasks

| # | Task | Details |
|---|---|---|
| 4.1 | **Shared logic extraction** | Create `packages/core` monorepo with all pure logic |
| 4.2 | **React Native app** | Expo project + rebuild UI with native components + Reanimated |
| 4.3 | **Push Notifications** | Expo Notifications + Supabase Edge Functions for "Sensei" reminders |
| 4.4 | **Offline Mode** | Local-first DB (WatermelonDB or PowerSync) with sync-on-reconnect |
| 4.5 | **Store deployment** | EAS Build → App Store + Play Store, CI/CD on merge to `main` |

---

## Project Structure

```
animeworkout/
├── public/assets/
│   ├── senseis/              ← your vector character files
│   └── sfx/                  ← audio files
├── src/
│   ├── components/
│   │   ├── ui/               ← Button, Badge, Toggle, RankBadge
│   │   ├── hud/              ← PowerLevelRing, DailyQuestCard, StreakFlame
│   │   ├── workout/          ← ExerciseCard, ModeToggle, RestTimer
│   │   ├── effects/          ← LimitBreakOverlay, ParticleBurst
│   │   ├── builder/          ← ExercisePickerDrawer, RoutineList
│   │   ├── achievements/     ← AchievementToast
│   │   ├── social/           ← ShareCard
│   │   └── layout/           ← AppShell, Sidebar, ProtectedRoute
│   ├── pages/                ← all route pages
│   ├── stores/               ← Zustand stores
│   ├── hooks/                ← useAuth, useExercises, useSession
│   ├── lib/                  ← supabase.ts, xp.ts, sfx.ts
│   ├── data/                 ← senseis.ts, progressionTrees.ts
│   └── styles/               ← anime-utilities.css
├── supabase/migrations/      ← SQL migration files
├── .env.example
├── vite.config.ts
└── package.json
```

---

## Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Vector assets delayed | Blocks Sensei screen & celebrations | Use high-quality placeholders; swap when ready |
| Supabase free-tier limits | 500 MB DB, 1 GB storage | Monitor; upgrade to Pro ($25/mo) if needed |
| Framer Motion bundle size | ~30 kB gzipped | Tree-shake, lazy-load effect components |
| React Native port complexity | Phase 4 timeline risk | Strict logic/UI separation from Day 1 |

---

## Verification Approach

- **Unit tests** (Vitest): XP formulas, store transitions, utility functions
- **Component tests** (RTL): Card renders, toggle filtering, progress ring
- **E2E tests** (Playwright): Auth → Dashboard → Workout → XP awarded
- **Manual QA per phase**: Detailed checklist (see implementation plan)
