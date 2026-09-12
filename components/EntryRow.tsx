"use client";

import type { MilkEntry } from "@/lib/types";
import { getFreshnessStatus, FRESHNESS_COLORS } from "@/lib/expiration";
import { formatDateShort } from "@/lib/date";

export default function EntryRow({
  entry,
  onMarkUsed,
}: {
  entry: MilkEntry;
  onMarkUsed: (id: string) => void;
}) {
  const isStored = entry.status === "stored";
  const status = isStored ? getFreshnessStatus(entry.date_pumped) : null;
  const colors = status ? FRESHNESS_COLORS[status] : null;

  return (
    <li>
      <button
        type="button"
        onClick={() => isStored && onMarkUsed(entry.id)}
        disabled={!isStored}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-surface px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-foreground">{entry.ounces} oz</span>
            <span className="text-sm text-foreground-muted">{formatDateShort(entry.date_pumped)}</span>
          </div>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-foreground-muted">
            {isStored ? (
              <>
                <span className={`inline-block h-2 w-2 rounded-full ${colors?.dot}`} />
                <span>Stored &middot; by {entry.created_by}</span>
              </>
            ) : (
              <span>
                Used{entry.used_at ? ` ${formatDateShort(entry.used_at.slice(0, 10))}` : ""} &middot; by{" "}
                {entry.created_by}
              </span>
            )}
          </div>
        </div>
        {isStored && (
          <span className="shrink-0 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-foreground-muted">
            Tap to use
          </span>
        )}
      </button>
    </li>
  );
}
