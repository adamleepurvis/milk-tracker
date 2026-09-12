"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useEntries } from "@/lib/useEntries";
import { getFreshnessStatus } from "@/lib/expiration";
import { supabase } from "@/lib/supabase";
import EntryRow from "@/components/EntryRow";
import InstallBanner from "@/components/InstallBanner";

export default function LogPage() {
  const { entries, loading, error } = useEntries();

  const stored = useMemo(() => entries.filter((e) => e.status === "stored"), [entries]);
  const totalOunces = useMemo(
    () => Math.round(stored.reduce((sum, e) => sum + e.ounces, 0) * 100) / 100,
    [stored]
  );
  const nearingSixMonths = useMemo(
    () => stored.filter((e) => getFreshnessStatus(e.date_pumped) !== "green").length,
    [stored]
  );

  async function markUsed(id: string) {
    await supabase.from("milk_entries").update({ status: "used", used_at: new Date().toISOString() }).eq("id", id);
  }

  return (
    <div className="flex flex-1 flex-col gap-5 px-5 pb-24 pt-8">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Milk Tracker</h1>
        <div className="mt-4 rounded-2xl p-4" style={{ background: "var(--primary-soft)" }}>
          <div className="text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Total stored
          </div>
          <div className="mt-1 text-3xl font-semibold text-foreground">{totalOunces} oz</div>
        </div>
      </header>

      <InstallBanner />

      {nearingSixMonths > 0 && (
        <div
          className="rounded-xl px-4 py-3 text-sm font-medium"
          style={{ background: "var(--warning)", color: "var(--primary-foreground)" }}
        >
          {nearingSixMonths} {nearingSixMonths === 1 ? "bag" : "bags"} approaching 6 months &mdash; use soon
        </div>
      )}

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm" style={{ background: "var(--danger)", color: "white" }}>
          Couldn&rsquo;t load entries: {error}
        </div>
      )}

      <section className="flex-1">
        {loading ? (
          <p className="text-sm text-foreground-muted">Loading&hellip;</p>
        ) : entries.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-foreground-muted">
            No entries yet. Tap + to log the first one.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {entries.map((entry) => (
              <EntryRow key={entry.id} entry={entry} onMarkUsed={markUsed} />
            ))}
          </ul>
        )}
      </section>

      <Link
        href="/add"
        className="fixed bottom-6 right-6 flex h-16 w-16 items-center justify-center rounded-full text-3xl font-light shadow-lg"
        style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        aria-label="Add entry"
      >
        +
      </Link>
    </div>
  );
}
