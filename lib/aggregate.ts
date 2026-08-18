import type { Entry } from "./types";
import { startOfWeek, isoDate } from "./date";

export interface ChartPoint {
  key: string;
  label: string;
  ounces: number;
}

export function aggregateDaily(entries: Entry[]): ChartPoint[] {
  const totals = new Map<string, number>();
  for (const e of entries) {
    totals.set(e.date, (totals.get(e.date) ?? 0) + e.ounces);
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, ounces]) => ({
      key: date,
      label: new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      ounces: Math.round(ounces * 100) / 100,
    }));
}

export function aggregateWeekly(entries: Entry[]): ChartPoint[] {
  const totals = new Map<string, number>();
  for (const e of entries) {
    const weekStart = isoDate(startOfWeek(new Date(`${e.date}T00:00:00`)));
    totals.set(weekStart, (totals.get(weekStart) ?? 0) + e.ounces);
  }
  return [...totals.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([weekStart, ounces]) => ({
      key: weekStart,
      label: `Wk of ${new Date(`${weekStart}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })}`,
      ounces: Math.round(ounces * 100) / 100,
    }));
}
