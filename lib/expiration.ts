import type { Destination, FreezerType } from "./types";

export type FreshnessStatus = "green" | "yellow" | "red";

export interface StorageLimits {
  /** Days at which milk is still comfortably within guidance. */
  goodDays: number;
  /** Outer day limit ("use by") guidance still calls acceptable. */
  maxDays: number;
  label: string;
}

export function getStorageLimits(
  destination: Destination,
  freezerType: FreezerType
): StorageLimits | null {
  if (destination === "fridge") {
    return { goodDays: 3, maxDays: 4, label: "Fridge: best within 4 days" };
  }
  if (destination === "freezer") {
    if (freezerType === "deep") {
      return { goodDays: 300, maxDays: 365, label: "Deep freezer: good up to 12 months" };
    }
    return { goodDays: 183, maxDays: 365, label: "Freezer: best 6 months, ok up to 12 months" };
  }
  return null; // "fresh" entries aren't stored, so no expiration applies
}

export function ageInDays(dateStr: string, from: Date = new Date()): number {
  const start = new Date(`${dateStr}T00:00:00`);
  const diffMs = from.setHours(0, 0, 0, 0) - start.getTime();
  return Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
}

export function getFreshnessStatus(
  ageDays: number,
  limits: StorageLimits
): FreshnessStatus {
  if (ageDays >= limits.maxDays) return "red";
  if (ageDays >= limits.goodDays) return "yellow";
  return "green";
}

export const FRESHNESS_COLORS: Record<FreshnessStatus, { bg: string; text: string; dot: string }> = {
  green: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  yellow: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  red: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};
