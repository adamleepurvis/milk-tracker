import { addMonths, daysBetween } from "./date";

export type FreshnessStatus = "green" | "yellow" | "red";

const YELLOW_AT_MONTHS = 5;
const RED_AT_MONTHS = 6;
/** How far ahead of the 6-month mark the push notification fires. */
export const PUSH_WINDOW_DAYS = 14;

export function getFreshnessStatus(datePumped: string, today: Date = new Date()): FreshnessStatus {
  const sixMonthMark = addMonths(datePumped, RED_AT_MONTHS);
  const fiveMonthMark = addMonths(datePumped, YELLOW_AT_MONTHS);
  if (today >= sixMonthMark) return "red";
  if (today >= fiveMonthMark) return "yellow";
  return "green";
}

export function daysUntilSixMonths(datePumped: string, today: Date = new Date()): number {
  const sixMonthMark = addMonths(datePumped, RED_AT_MONTHS);
  return daysBetween(today, sixMonthMark);
}

export const FRESHNESS_COLORS: Record<FreshnessStatus, { bg: string; text: string; dot: string }> = {
  green: { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  yellow: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  red: { bg: "bg-rose-50", text: "text-rose-700", dot: "bg-rose-500" },
};
