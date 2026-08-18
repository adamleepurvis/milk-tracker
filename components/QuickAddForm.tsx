"use client";

import { useState, useRef } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import type { Destination, Side } from "@/lib/types";
import { DESTINATION_LABELS, SIDE_LABELS } from "@/lib/types";
import { todayDate, nowTime, formatTime12h, formatDateShort } from "@/lib/date";

const DESTINATIONS: Destination[] = ["fridge", "freezer", "fresh"];
const SIDES: Side[] = ["left", "right", "both", "n/a"];

export default function QuickAddForm() {
  const [ounces, setOunces] = useState("");
  const [destination, setDestination] = useState<Destination>("freezer");
  const [side, setSide] = useState<Side>("both");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(todayDate);
  const [time, setTime] = useState(nowTime);
  const [showDetails, setShowDetails] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const ouncesInputRef = useRef<HTMLInputElement>(null);

  const recent = useLiveQuery(
    () => db.entries.orderBy("createdAt").reverse().limit(3).toArray(),
    []
  );

  const parsedOunces = parseFloat(ounces);
  const canSubmit = ounces.trim() !== "" && !Number.isNaN(parsedOunces) && parsedOunces > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    await db.entries.add({
      date,
      time,
      ounces: parsedOunces,
      side,
      destination,
      notes: note.trim() || undefined,
      createdAt: new Date().toISOString(),
    });

    setOunces("");
    setNote("");
    setDate(todayDate());
    setTime(nowTime());
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1200);
    ouncesInputRef.current?.focus();
  }

  return (
    <div className="flex flex-1 flex-col px-5 pb-6 pt-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Milk Tracker</h1>
        <p className="mt-1 text-sm text-foreground-muted">Quick add a pumping session</p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
        <div>
          <label htmlFor="ounces" className="mb-2 block text-sm font-medium text-foreground-muted">
            Ounces
          </label>
          <input
            ref={ouncesInputRef}
            id="ounces"
            name="ounces"
            type="number"
            inputMode="decimal"
            step="0.5"
            min="0"
            placeholder="0.0"
            value={ounces}
            onChange={(e) => setOunces(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface px-5 py-6 text-center text-5xl font-semibold text-foreground shadow-sm outline-none focus:border-primary"
            autoFocus
          />
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-foreground-muted">Destination</span>
          <div className="grid grid-cols-3 gap-2">
            {DESTINATIONS.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDestination(d)}
                className="rounded-xl py-4 text-base font-medium transition-colors"
                style={
                  destination === d
                    ? { background: "var(--primary)", color: "var(--primary-foreground)" }
                    : { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }
                }
                aria-pressed={destination === d}
              >
                {DESTINATION_LABELS[d]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-2 block text-sm font-medium text-foreground-muted">Side</span>
          <div className="grid grid-cols-4 gap-2">
            {SIDES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSide(s)}
                className="rounded-xl py-3 text-sm font-medium transition-colors"
                style={
                  side === s
                    ? { background: "var(--accent)", color: "var(--primary-foreground)" }
                    : { background: "var(--surface)", color: "var(--foreground)", border: "1px solid var(--border)" }
                }
                aria-pressed={side === s}
              >
                {SIDE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowDetails((v) => !v)}
          className="self-start text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          {showDetails ? "Hide" : "Edit"} date, time &amp; note
        </button>

        {showDetails && (
          <div className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="date" className="mb-1 block text-xs font-medium text-foreground-muted">
                  Date
                </label>
                <input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="time" className="mb-1 block text-xs font-medium text-foreground-muted">
                  Time
                </label>
                <input
                  id="time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
            <div>
              <label htmlFor="note" className="mb-1 block text-xs font-medium text-foreground-muted">
                Note (optional)
              </label>
              <input
                id="note"
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. back of freezer"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
              />
            </div>
          </div>
        )}

        <div className="mt-auto pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl py-5 text-lg font-semibold shadow-sm transition-all disabled:opacity-40"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {savedFlash ? "Saved ✓" : "Save session"}
          </button>
        </div>
      </form>

      {recent && recent.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground-muted">
            Just logged
          </h2>
          <ul className="flex flex-col gap-2">
            {recent.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-2.5 text-sm"
              >
                <span className="font-medium text-foreground">
                  {entry.ounces} oz · {DESTINATION_LABELS[entry.destination]}
                </span>
                <span className="text-foreground-muted">
                  {formatDateShort(entry.date)}, {formatTime12h(entry.time)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
