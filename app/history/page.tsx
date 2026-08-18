"use client";

import { useMemo, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Destination } from "@/lib/types";
import { DESTINATION_LABELS } from "@/lib/types";
import { aggregateDaily, aggregateWeekly } from "@/lib/aggregate";
import HistoryChart from "@/components/HistoryChart";
import { formatDateShort, formatTime12h, isoDate } from "@/lib/date";

type RangePreset = "7" | "30" | "all";
type DestinationFilter = Destination | "all";
type ChartMode = "daily" | "weekly";

const DESTINATION_FILTERS: DestinationFilter[] = ["all", "fridge", "freezer", "fresh"];

function rangeStart(preset: RangePreset): Date | null {
  if (preset === "all") return null;
  const days = preset === "7" ? 6 : 29;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

export default function HistoryPage() {
  const [rangePreset, setRangePreset] = useState<RangePreset>("30");
  const [destFilter, setDestFilter] = useState<DestinationFilter>("all");
  const [chartMode, setChartMode] = useState<ChartMode>("daily");

  const allEntries = useLiveQuery(() => db.entries.orderBy("date").reverse().toArray(), []);

  const startDate = useMemo(() => rangeStart(rangePreset), [rangePreset]);
  const startDateStr = startDate ? isoDate(startDate) : null;

  const inRange = useMemo(() => {
    if (!allEntries) return [];
    if (!startDateStr) return allEntries;
    return allEntries.filter((e) => e.date >= startDateStr);
  }, [allEntries, startDateStr]);

  const filtered = useMemo(
    () => (destFilter === "all" ? inRange : inRange.filter((e) => e.destination === destFilter)),
    [inRange, destFilter]
  );

  const chartData = useMemo(
    () => (chartMode === "daily" ? aggregateDaily(inRange) : aggregateWeekly(inRange)),
    [inRange, chartMode]
  );

  async function deleteEntry(id: number) {
    await db.entries.delete(id);
  }

  if (!allEntries) {
    return <div className="flex-1 px-5 pt-8 text-foreground-muted">Loading…</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 pb-6 pt-8">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">History</h1>
        <p className="mt-1 text-sm text-foreground-muted">All logged sessions</p>
      </header>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">Totals</h2>
          <div className="flex gap-1 rounded-full bg-surface-muted p-1 text-xs">
            {(["daily", "weekly"] as ChartMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setChartMode(mode)}
                className="rounded-full px-2.5 py-1 font-medium capitalize transition-colors"
                style={
                  chartMode === mode
                    ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                    : { color: "var(--foreground-muted)" }
                }
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
        <HistoryChart data={chartData} />
      </section>

      <section className="flex flex-col gap-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(["7", "30", "all"] as RangePreset[]).map((preset) => (
            <FilterChip
              key={preset}
              active={rangePreset === preset}
              onClick={() => setRangePreset(preset)}
              label={preset === "all" ? "All time" : `Last ${preset} days`}
            />
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {DESTINATION_FILTERS.map((d) => (
            <FilterChip
              key={d}
              active={destFilter === d}
              onClick={() => setDestFilter(d)}
              label={d === "all" ? "All" : DESTINATION_LABELS[d]}
            />
          ))}
        </div>
      </section>

      <section>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-foreground-muted">
            No entries in this range.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {filtered.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-semibold text-foreground">{entry.ounces} oz</span>
                    <span className="text-xs text-foreground-muted">
                      {DESTINATION_LABELS[entry.destination]}
                      {entry.usedAt ? " · used" : ""}
                    </span>
                  </div>
                  <div className="mt-0.5 text-xs text-foreground-muted">
                    {formatDateShort(entry.date)} · {formatTime12h(entry.time)}
                    {entry.notes ? ` · ${entry.notes}` : ""}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => entry.id && deleteEntry(entry.id)}
                  className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted transition-colors hover:border-danger hover:text-danger"
                  aria-label="Delete entry"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors"
      style={
        active
          ? { background: "var(--primary)", color: "var(--primary-foreground)" }
          : { background: "var(--surface)", color: "var(--foreground-muted)", border: "1px solid var(--border)" }
      }
    >
      {label}
    </button>
  );
}
