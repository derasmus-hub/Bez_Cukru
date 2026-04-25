# Bez Cukru — 30 Dni Bez Cukru

A small, focused tracker for a 30-day sugar-free challenge.

I built this for my wife in a weekend. She'd been tracking her sugar-free challenge on paper, crossing off days as she went. The paper version worked fine until it didn't — pages get lost, and there's no way to pick up where you left off if you check on a different device. So I built her this.

**Live:** [bez-cukru.vercel.app](https://bez-cukru.vercel.app)

## What it does

One screen. Log in. See a 30-day grid where each day is a numbered circle. Tap a circle to mark the day complete — it fills with an emerald gradient and a checkmark. Tap again to undo. A progress card above the grid shows your live count (e.g. `4 / 30`) and percentage with a gradient progress bar.

Progress is tied to your account, persisted in Postgres, and survives page refreshes, browser closes, and switching devices. That last part was the actual point.

## Stack

- **Frontend:** React 18 + Vite 6 (SPA)
- **Routing:** React Router 7
- **Auth:** Supabase Auth (email + password)
- **Database:** Supabase Postgres — `challenge_days` table, scoped per-user via `user_id`
- **Styling:** Tailwind CSS 4 with a small custom design system in `src/index.css` — `@theme` tokens for an emerald palette, reusable `@layer components` for 3D buttons, cards, progress bars, and day circles
- **Hosting:** Vercel

No state library, no animation library, no realtime — just `useState`, fetch on mount, and pure CSS transitions for the soft 3D button feel (layered inset/outset shadows, hover-lift, active-press).

## How the per-user data works

On first sign-in, `seedUserData()` auto-creates 30 day rows for that user in `challenge_days`. Each row has a `day_number` (1–30), a `completed` boolean, and the `user_id` from Supabase Auth. Toggling a day flips `completed` for the matching row. Row-level security in Postgres ensures one user can't read or write another user's rows.

## Local setup

```bash
git clone https://github.com/derasmus-hub/Bez_Cukru.git
cd Bez_Cukru
npm install
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY from your Supabase project
npm run dev
```

To set up the database, run `supabase/schema.sql` in the Supabase SQL Editor.

## Why I'm sharing this

Most of what I build is internal — for clients, for Erasmus Labs, or for myself. Bez Cukru is small enough to share and complete enough to demonstrate the patterns I default to: explicit data scoping per user, clean component boundaries, no unnecessary abstractions, and design systems that live in CSS rather than runtime libraries.

If you want to talk about backend or AI integration work, I'm at erasmusduan@gmail.com.
