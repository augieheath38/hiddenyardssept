# Hidden Yards

A special-teams field-position tracker for football coaches — log kickoffs, punts,
PATs, field goals, and drives, then break the numbers down by game and by season.

This is a Vite + React app with real accounts and persistent storage via Supabase.
Each coach only sees their own games (enforced by Postgres Row Level Security, not
just app logic).

## 1. Create your Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. In the Supabase dashboard, go to **SQL Editor**, paste in the contents of
   [`supabase/schema.sql`](./supabase/schema.sql), and run it. This creates the
   `profiles` and `games` tables with row-level security so each coach's data is
   private to them.
3. Go to **Project Settings → API**. You'll need two values from there:
   - **Project URL**
   - **anon / public key**
4. (Optional) Go to **Authentication → Providers → Email** and turn off "Confirm
   email" if you want new accounts to be usable immediately without a
   confirmation email. Leave it on for production.

## 2. Run it locally

```bash
npm install
cp .env.example .env
```

Open `.env` and fill in the two values from step 1:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then:

```bash
npm run dev
```

Open the local URL it prints. Create an account — it will create a real Supabase
Auth user, a row in `profiles`, and from then on every game you log is saved to
the `games` table.

## 3. Push to GitHub

```bash
git init
git add .
git commit -m "Hidden Yards: live app with Supabase"
git branch -M main
git remote add origin https://github.com/<your-username>/hidden-yards.git
git push -u origin main
```

(`.env` is already in `.gitignore` — your Supabase keys won't be committed. The
anon key is safe to expose in a deployed frontend; it only grants what your RLS
policies allow.)

## 4. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project**, and import your
   GitHub repo.
2. Vercel will auto-detect Vite. Leave the build settings as-is
   (`npm run build`, output directory `dist`).
3. Under **Environment Variables**, add the same two variables from your `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Click **Deploy**. Every push to `main` will auto-deploy from here on.

## How data flows

- **Auth** — Supabase Auth (email + password) replaces the old fake sign-up form.
- **Profiles** — school name, level, and email are stored in `public.profiles`,
  one row per coach.
- **Games** — each game (with all its plays nested inside) is stored as one JSON
  row in `public.games`, keyed by the game's id. This keeps the app's existing
  data shape intact — no need to rebuild every play type as its own table right
  now. If you later want cross-game querying at the play level (e.g. "average
  punt hangtime across every team in the database"), that's a good next step,
  but isn't required to have a working, persistent, multi-user app today.
- **Row Level Security** — every policy checks `auth.uid()`, so even though the
  frontend only ever asks for "my games," the database itself refuses to return
  or accept writes for anyone else's data.

## What's still a placeholder

The "Paid tools" section (Benchmarking, Data Review, Kicker Fix Coaching,
Resources) is UI-only, same as in the original prototype — there's no billing or
gating wired up yet. That's a separate project (e.g. Stripe + a `plan` column on
`profiles`) whenever you're ready for it.
"# hiddenyardssept" 
