"use client";

import { useRef, useState } from "react";
import type { Entry, FreezerType } from "@/lib/types";
import { ageInDays, getFreshnessStatus, getStorageLimits, FRESHNESS_COLORS } from "@/lib/expiration";
import { formatDateShort } from "@/lib/date";

const SWIPE_THRESHOLD = 88;

export default function InventoryRow({
  entry,
  freezerType,
  onMarkUsed,
}: {
  entry: Entry;
  freezerType: FreezerType;
  onMarkUsed: (id: number) => void;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);

  const limits = getStorageLimits(entry.destination, freezerType);
  const age = ageInDays(entry.date);
  const status = limits ? getFreshnessStatus(age, limits) : "green";
  const colors = FRESHNESS_COLORS[status];

  function onPointerDown(e: React.PointerEvent) {
    startX.current = e.clientX;
    setDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const delta = e.clientX - startX.current;
    setDragX(Math.min(0, delta));
  }

  function onPointerUp() {
    setDragging(false);
    if (dragX < -SWIPE_THRESHOLD && entry.id) {
      onMarkUsed(entry.id);
    }
    setDragX(0);
  }

  return (
    <li className="relative overflow-hidden rounded-xl">
      <div
        className="absolute inset-0 flex items-center justify-end rounded-xl px-5 text-sm font-semibold"
        style={{ background: "var(--success)", color: "var(--primary-foreground)" }}
        aria-hidden
      >
        Mark used
      </div>
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className="relative flex items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 touch-pan-y"
        style={{
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-foreground">{entry.ounces} oz</span>
            <span className="text-sm text-foreground-muted">{formatDateShort(entry.date)}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-foreground-muted">
            <span className={`inline-block h-2 w-2 rounded-full ${colors.dot}`} />
            <span>
              {age} {age === 1 ? "day" : "days"} old
              {limits ? ` · ${limits.label}` : ""}
            </span>
          </div>
          {entry.label && (
            <div className="mt-0.5 truncate text-xs text-foreground-muted italic">{entry.label}</div>
          )}
        </div>
        <button
          type="button"
          onClick={() => entry.id && onMarkUsed(entry.id)}
          className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted transition-colors hover:border-primary hover:text-primary"
        >
          Used
        </button>
      </div>
    </li>
  );
}
