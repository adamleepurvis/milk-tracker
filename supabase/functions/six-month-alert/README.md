# six-month-alert Edge Function

Daily cron that finds `stored` entries within 2 weeks of their 6-month mark and sends a
Web Push notification to every row in `push_subscriptions`. Marks each notified entry's
`notified_at` so it isn't re-sent every day of its 2-week window.

## 1. Generate a VAPID keypair (once, ever — not per deploy)

```bash
npx web-push generate-vapid-keys
```

This prints a public and private key. The public key also goes in the Next.js app's
`.env.local` as `NEXT_PUBLIC_VAPID_PUBLIC_KEY` — it must be the *same* keypair on both
sides, or push subscriptions created by the client won't validate against the server's
signature.

## 2. Set secrets on the Supabase project

```bash
supabase secrets set VAPID_PUBLIC_KEY=<public key>
supabase secrets set VAPID_PRIVATE_KEY=<private key>
supabase secrets set VAPID_SUBJECT=mailto:you@example.com
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are provided automatically to every Edge
Function — no need to set those.

## 3. Deploy

```bash
supabase functions deploy six-month-alert --no-verify-jwt
```

`--no-verify-jwt` is used because this function is only ever called by pg_cron (below),
not by the client app. Its URL isn't linked anywhere in the client, but it isn't secret
either — this matches the app's overall "household passcode, not real security" model
described at the top of `supabase/migrations/0001_init.sql`.

## 4. Schedule it (daily cron)

Run this once in the Supabase SQL editor (fill in your project ref if different from
`dpiegpaaleikmczaodxe`). This uses `pg_cron` + `pg_net` to call the deployed function
once a day:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'six-month-alert-daily',
  '0 14 * * *', -- 14:00 UTC; adjust to a reasonable local morning time
  $$
  select net.http_post(
    url := 'https://dpiegpaaleikmczaodxe.supabase.co/functions/v1/six-month-alert',
    headers := jsonb_build_object('Content-Type', 'application/json')
  );
  $$
);
```

No `Authorization` header is needed here since the function is deployed with
`--no-verify-jwt`. If you'd rather require one anyway (defense in depth, since the
function's URL could be guessed), add `'Authorization', 'Bearer <service_role key>'` to
the `headers` object above — but then the function would need to actually check for it,
which the current `index.ts` doesn't do.

Alternatively, use the Supabase dashboard's **Edge Functions -> Cron** UI, which wraps
the same `pg_cron`/`pg_net` setup without hand-writing SQL.

## Testing it manually

```bash
supabase functions invoke six-month-alert
```

Returns `{ sent, entries }` — `entries` is how many stored bags are currently in the
2-week window, `sent` is how many push deliveries succeeded.
