# Finishing setup (Supabase + deploy)

This sandbox's network policy blocks `*.supabase.co` and `api.supabase.com`
entirely, so none of the steps below could be run from inside the coding
session — not the CLI (needs `api.supabase.com`), not even a plain `curl` to
the project's REST API. Confirmed directly (a request to
`dpiegpaaleikmczaodxe.supabase.co` was rejected at the connection level by the
sandbox's egress proxy), not assumed. These steps need to run from your own
machine or the Supabase dashboard.

Your project:

- Project ref: `dpiegpaaleikmczaodxe`
- Project URL: `https://dpiegpaaleikmczaodxe.supabase.co`

## 1. Push the schema

From the `milk-tracker/` folder, on your own machine:

```bash
npx supabase login
npx supabase link --project-ref dpiegpaaleikmczaodxe
npx supabase db push
```

This applies `supabase/migrations/0001_init.sql` — creates `milk_entries` and
`push_subscriptions`, enables realtime on `milk_entries`, and sets up RLS
(see the comment at the top of that file for the security model: a shared
passcode, not per-user auth).

If you'd rather not use the CLI, you can instead paste the contents of
`supabase/migrations/0001_init.sql` into the Supabase dashboard's SQL Editor
and run it once.

## 2. Set up push notifications

Follow `supabase/functions/six-month-alert/README.md` in full — it covers:

1. Generating a VAPID keypair (`npx web-push generate-vapid-keys`)
2. Setting `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` as
   function secrets
3. Deploying the function: `npx supabase functions deploy six-month-alert --no-verify-jwt`
4. Scheduling the daily cron (SQL snippet included in that README)

## 3. Configure the app

Copy `.env.local.example` to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://dpiegpaaleikmczaodxe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key, from Project Settings -> API>
NEXT_PUBLIC_HOUSEHOLD_PASSCODE=<pick something>
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<the public half from step 2.1>
```

Then:

```bash
npm install
npm run dev
```

to try it locally, or deploy it (e.g. to Vercel) so both phones can open the
same install URL, per the spec. Either way, once deployed with real Supabase
credentials, verify the whole loop once: add an entry on one device, confirm
it appears live on the other, mark it used, and (once the cron is scheduled)
either wait for a real 6-month-old entry or temporarily backdate a test entry
to trigger the alert and confirm the push arrives.

## About the access token you shared in chat

I can't use it from here (network policy blocks the API it talks to), so
nothing was done with it. Since it's a full personal access token pasted into
a chat transcript, it's worth rotating in the Supabase dashboard (Account
Settings -> Access Tokens) once you're done with setup, as routine hygiene.
