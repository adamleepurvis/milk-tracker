# Milk Tracker

A mobile-first, installable PWA for logging breast milk pumping sessions and tracking
freezer/fridge inventory. Local-first: all data lives in IndexedDB on-device, works fully
offline, and there's no account or server.

## Features

- **Quick Add** — thumb-friendly form for logging a pumping session in one tap; stays on
  screen for fast repeated entries.
- **Inventory** — freezer and fridge totals, FIFO-sorted lists, age and color-coded
  storage-life indicators, swipe-or-tap to mark an entry used.
- **History** — full log filterable by date range and destination, with a daily/weekly
  totals chart.
- **Settings** — freezer type (standard vs. deep) for storage-life guidance, plus
  JSON/CSV export and JSON import for backup (this is the only backup — there's no cloud
  sync).

## Stack

Next.js (App Router) + TypeScript + Tailwind, Dexie for IndexedDB, Recharts for charts,
Serwist for the service worker/PWA install experience.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Building

```bash
npm run build   # runs `next build --webpack`
npm run start
```

The production build must run with `--webpack` (already wired into the `build` script)
because Serwist's Next integration generates the service worker via a webpack plugin,
which isn't supported by Turbopack yet. `next dev` still uses Turbopack as normal — the
service worker step is disabled in development.
