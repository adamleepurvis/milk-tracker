"use client";

import { useEffect, useState } from "react";
import { supabase } from "./supabase";
import type { MilkEntry } from "./types";

function sortEntries(entries: MilkEntry[]): MilkEntry[] {
  return [...entries].sort((a, b) => {
    if (a.date_pumped !== b.date_pumped) return b.date_pumped.localeCompare(a.date_pumped);
    return b.created_at.localeCompare(a.created_at);
  });
}

export function useEntries() {
  const [entries, setEntries] = useState<MilkEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const timeoutController = new AbortController();
      const timeout = setTimeout(() => timeoutController.abort(), 10_000);
      try {
        const { data, error } = await supabase
          .from("milk_entries")
          .select("*")
          .abortSignal(timeoutController.signal);
        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setEntries(sortEntries(data as MilkEntry[]));
        }
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof DOMException && err.name === "AbortError"
            ? "Timed out reaching the server."
            : err instanceof Error
              ? err.message
              : "Couldn't reach the server."
        );
      } finally {
        clearTimeout(timeout);
        if (!cancelled) setLoading(false);
      }
    }
    load();

    const channel = supabase
      .channel("milk_entries_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "milk_entries" },
        (payload) => {
          setEntries((current) => {
            if (payload.eventType === "DELETE") {
              return current.filter((e) => e.id !== (payload.old as MilkEntry).id);
            }
            const next = payload.new as MilkEntry;
            const withoutNext = current.filter((e) => e.id !== next.id);
            return sortEntries([...withoutNext, next]);
          });
        }
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { entries, loading, error };
}
