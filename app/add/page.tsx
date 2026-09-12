"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { todayDate } from "@/lib/date";
import { useCreatedBy } from "@/lib/identity-context";

export default function AddEntryPage() {
  const router = useRouter();
  const createdBy = useCreatedBy();
  const [date, setDate] = useState(todayDate);
  const [ounces, setOunces] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ouncesRef = useRef<HTMLInputElement>(null);

  const parsedOunces = parseFloat(ounces);
  const canSubmit = ounces.trim() !== "" && !Number.isNaN(parsedOunces) && parsedOunces > 0 && !saving;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("milk_entries").insert({
      date_pumped: date,
      ounces: parsedOunces,
      status: "stored",
      created_by: createdBy,
    });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push("/");
  }

  return (
    <div className="flex flex-1 flex-col px-5 pb-6 pt-8">
      <header className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="text-2xl text-foreground-muted"
          aria-label="Back to log"
        >
          &larr;
        </button>
        <h1 className="text-2xl font-semibold text-foreground">Add Entry</h1>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-6">
        <div>
          <label htmlFor="ounces" className="mb-2 block text-sm font-medium text-foreground-muted">
            Ounces
          </label>
          <input
            ref={ouncesRef}
            id="ounces"
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
          <label htmlFor="date" className="mb-2 block text-sm font-medium text-foreground-muted">
            Date pumped
          </label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-base outline-none focus:border-primary"
          />
        </div>

        {error && (
          <p className="text-sm" style={{ color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <div className="mt-auto pt-2">
          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-2xl py-5 text-lg font-semibold shadow-sm transition-opacity disabled:opacity-40"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            {saving ? "Saving…" : "Save entry"}
          </button>
        </div>
      </form>
    </div>
  );
}
