# Milk Tracker

A mobile-first, installable PWA for logging breast milk pumping sessions and freezer
inventory, shared live between two devices via Supabase. No accounts — just a household
passcode and a first-run "Dad" / "Mom" name picker.

## Features

- **Log (home)** — reverse-chronological list of all entries, synced in real time between
  both phones. Running total of ounces currently stored. Entries within 2 weeks of 6
  months old are flagged yellow/red; tap an entry to mark it used.
- **Add Entry** — two fields (date, ounces), one tap to save.
- **6-month alerts** — an in-app banner, plus a real Web Push notification sent by a daily
  Supabase Edge Function cron. Requires adding the app to the home screen on iOS (Safari
  won't deliver push to a browser tab) — the app prompts for this.

## Stack

Next.js (App Router) + TypeScript + Tailwind, Supabase (Postgres + Realtime + Edge
Functions) as the shared backend, Serwist for the service worker/PWA install experience,
Web Push for notifications.

## Getting started

1. Copy `.env.local.example` to `.env.local` and fill in your Supabase project's URL/anon
   key, a household passcode, and a VAPID public key.
2. `npm install`
3. `npm run dev`, open [http://localhost:3000](http://localhost:3000).

**First time setting this up?** See [`SETUP.md`](./SETUP.md) for pushing the database
schema, deploying the alert function, and generating VAPID keys.

## Building

```bash
npm run build   # runs `next build --webpack`
npm run start
```

The production build must run with `--webpack` (already wired into the `build` script)
because Serwist's Next integration generates the service worker via a webpack plugin,
which isn't supported by Turbopack yet. `next dev` still uses Turbopack as normal — the
service worker step is disabled in development.

## Security model

This is a two-person household app, not a public product: there's no per-user auth, just
a client-side passcode gate and RLS policies that grant the `anon` role full access. See
the comment at the top of `supabase/migrations/0001_init.sql` for the tradeoff this
implies (the Supabase anon key is a "shared household secret," not a real security
boundary).
