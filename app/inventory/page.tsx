"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { db, getSettings } from "@/lib/db";
import InventoryRow from "@/components/InventoryRow";
import type { Entry } from "@/lib/types";

function sumOunces(entries: Entry[] | undefined): number {
  if (!entries) return 0;
  return entries.reduce((sum, e) => sum + e.ounces, 0);
}

export default function InventoryPage() {
  const settings = useLiveQuery(getSettings, []);
  const inStock = useLiveQuery(
    () => db.entries.filter((e) => !e.usedAt && (e.destination === "fridge" || e.destination === "freezer")).toArray(),
    []
  );

  const freezerEntries = (inStock ?? [])
    .filter((e) => e.destination === "freezer")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  const fridgeEntries = (inStock ?? [])
    .filter((e) => e.destination === "fridge")
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  async function markUsed(id: number) {
    await db.entries.update(id, { usedAt: new Date().toISOString() });
  }

  if (!settings || !inStock) {
    return <div className="flex-1 px-5 pt-8 text-foreground-muted">Loading…</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-8 px-5 pb-6 pt-8">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Inventory</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Swipe or tap &ldquo;Used&rdquo; to remove an entry from stock
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={{ background: "var(--primary-soft)" }}>
          <div className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Freezer</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">
            {sumOunces(freezerEntries).toFixed(1)} oz
          </div>
        </div>
        <div className="rounded-2xl p-4" style={{ background: "var(--accent-soft)" }}>
          <div className="text-xs font-medium uppercase tracking-wide text-foreground-muted">Fridge</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">
            {sumOunces(fridgeEntries).toFixed(1)} oz
          </div>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Freezer ({freezerEntries.length})
        </h2>
        {freezerEntries.length === 0 ? (
          <EmptyState text="No milk in the freezer yet." />
        ) : (
          <ul className="flex flex-col gap-2">
            {freezerEntries.map((entry) => (
              <InventoryRow
                key={entry.id}
                entry={entry}
                freezerType={settings.freezerType}
                onMarkUsed={markUsed}
              />
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Fridge ({fridgeEntries.length})
        </h2>
        {fridgeEntries.length === 0 ? (
          <EmptyState text="No milk in the fridge yet." />
        ) : (
          <ul className="flex flex-col gap-2">
            {fridgeEntries.map((entry) => (
              <InventoryRow
                key={entry.id}
                entry={entry}
                freezerType={settings.freezerType}
                onMarkUsed={markUsed}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-foreground-muted">
      {text}
    </div>
  );
}
