# Meal Planner — Erasmus Labs

A lightweight meal-planning app for browsing recipes, viewing weekly meal plans, and generating shopping lists. Built with React + Vite, hosted on Vercel, backed by Supabase Postgres.

## Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v4
- **Database:** Supabase Postgres (free tier)
- **Hosting:** Vercel (free tier)
- **Auth:** Shared access code (no user accounts)
- **Backend:** None — Supabase REST API via client SDK

## Local Setup

```bash
# 1. Clone and install
git clone <your-repo-url>
cd paul_app_idea
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your Supabase credentials and access code

# 3. Run dev server
npm run dev
```

## Supabase Setup

1. Create a free project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in the dashboard
3. Paste the contents of `supabase/schema.sql` and click **Run**
4. Go to **Settings > API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public key** → `VITE_SUPABASE_ANON_KEY`
5. Paste these into your `.env` file

### Managing Content

All data is managed directly in the **Supabase Table Editor** (Dashboard > Table Editor):

- **recipes** — Add/edit recipe title, description, servings, prep/cook time, image URL
- **ingredients** — Add ingredients per recipe (use `sort_order` to control display order)
- **instructions** — Add numbered steps per recipe
- **meal_plans** — Create a row with `week_start` set to a Monday date (e.g. `2026-04-13`)
- **meal_plan_items** — Assign recipes to days (0=Mon, 6=Sun) and meal types (breakfast/lunch/dinner)

## Vercel Deployment

### Option A: GitHub Integration (recommended)

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) and import the repo
3. Add environment variables in Vercel project settings:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ACCESS_CODE`
4. Deploy — Vercel auto-detects Vite and builds it

### Option B: CLI

```bash
npm i -g vercel
vercel
# Follow prompts, then set env vars in the dashboard
```

### Custom Domain

1. In Vercel project settings, go to **Domains**
2. Add your domain (e.g. `mealplanner.erasmuslabs.com`)
3. Update DNS records as shown by Vercel (usually a CNAME)
4. SSL is automatic

## Cost Breakdown

### Why this is free for ~45 users

| Service | Free Tier Limits | Your Usage |
|---------|-----------------|------------|
| **Vercel Hobby** | 100GB bandwidth, unlimited deploys | ~45 users = negligible |
| **Supabase Free** | 500MB database, 50K monthly active users, 500K API requests | Recipe data = a few MB, 45 MAU |
| **Total** | | **$0/month** |

### What stays free

- 45 users browsing recipes and meal plans
- A few hundred recipes with ingredients
- Weekly meal plan updates
- All static asset hosting on Vercel's CDN

### When you might need to upgrade

| Trigger | Threshold | Cost |
|---------|-----------|------|
| Supabase database exceeds 500MB | Thousands of recipes with images stored in Supabase Storage | $25/mo (Pro) |
| Need real user accounts | Per-user data, personal meal plans | $25/mo (Supabase Pro for Auth) |
| Vercel bandwidth spike | Unlikely at 45 users | $20/mo (Pro) |
| Custom backend logic needed | Complex server-side processing | Add Vercel serverless functions (included in free tier) |

**Realistic estimate:** This app will run at $0/month for its intended use case. The free tiers are generous enough that 45 users with low write volume won't come close to any limit.

### Tip: Image hosting

Store recipe images externally (e.g. paste an image URL from Unsplash or any CDN) rather than uploading to Supabase Storage. This keeps your database small and avoids storage costs entirely.

## Project Structure

```
src/
├── components/
│   ├── Layout.jsx           # Nav + footer shell
│   ├── PasswordGate.jsx     # Shared access code screen
│   └── ui/
│       ├── Card.jsx
│       └── LoadingSpinner.jsx
├── pages/
│   ├── Recipes.jsx          # Recipe grid with search
│   ├── RecipeDetail.jsx     # Full recipe view
│   ├── MealPlan.jsx         # Weekly meal plan grid
│   └── ShoppingList.jsx     # Auto-generated shopping list
├── lib/
│   └── supabase.js          # Supabase client init
├── App.jsx                  # Routes
├── main.jsx                 # Entry point
└── index.css                # Tailwind imports
```

## Cloning for Future Mini-Tools

This project is designed as a template. To create a new Erasmus Labs mini-tool:

1. Copy this repo
2. Replace pages in `src/pages/` with your new features
3. Update the SQL schema for your data model
4. Update branding text in `Layout.jsx` and `PasswordGate.jsx`
5. Deploy to a new Vercel project with its own Supabase instance
