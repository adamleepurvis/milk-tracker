// Daily cron: finds stored milk_entries approaching their 6-month mark and sends a
// Web Push notification to every subscribed device. See README.md in this folder for
// how to set the required secrets and schedule this function.
import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:example@example.com";

const SIX_MONTHS_DAYS = 183; // approximation of 6 calendar months, matched to the app's push window
const PUSH_WINDOW_DAYS = 14;

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

interface MilkEntry {
  id: string;
  date_pumped: string;
  ounces: number;
}

interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

function daysOld(datePumped: string): number {
  const pumped = new Date(`${datePumped}T00:00:00Z`);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return Math.round((today.getTime() - pumped.getTime()) / (1000 * 60 * 60 * 24));
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const { data: candidates, error: candidatesError } = await supabase
    .from("milk_entries")
    .select("id, date_pumped, ounces")
    .eq("status", "stored")
    .is("notified_at", null);

  if (candidatesError) {
    return Response.json({ error: candidatesError.message }, { status: 500 });
  }

  const dueEntries = (candidates as MilkEntry[]).filter((entry) => {
    const age = daysOld(entry.date_pumped);
    return age >= SIX_MONTHS_DAYS - PUSH_WINDOW_DAYS && age < SIX_MONTHS_DAYS;
  });

  if (dueEntries.length === 0) {
    return Response.json({ sent: 0, entries: 0 });
  }

  const { data: subscriptions, error: subsError } = await supabase
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth");

  if (subsError) {
    return Response.json({ error: subsError.message }, { status: 500 });
  }

  const body = JSON.stringify({
    title: "Milk Tracker",
    body:
      dueEntries.length === 1
        ? `1 bag (${dueEntries[0].ounces} oz) is approaching 6 months — use soon.`
        : `${dueEntries.length} bags are approaching 6 months — use soon.`,
    url: "/",
  });

  let sent = 0;
  for (const sub of subscriptions as PushSubscriptionRow[]) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth },
        },
        body
      );
      sent += 1;
    } catch (err) {
      const statusCode = (err as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        // Subscription is no longer valid (app uninstalled, permission revoked, etc).
        await supabase.from("push_subscriptions").delete().eq("id", sub.id);
      } else {
        console.error("Failed to send push", sub.id, err);
      }
    }
  }

  await supabase
    .from("milk_entries")
    .update({ notified_at: new Date().toISOString() })
    .in(
      "id",
      dueEntries.map((e) => e.id)
    );

  return Response.json({ sent, entries: dueEntries.length });
});
