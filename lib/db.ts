import Dexie, { type EntityTable } from "dexie";
import type { Entry, Settings } from "./types";

class MilkTrackerDB extends Dexie {
  entries!: EntityTable<Entry, "id">;
  settings!: EntityTable<Settings, "id">;

  constructor() {
    super("milk-tracker");
    this.version(1).stores({
      entries: "++id, date, destination, usedAt, createdAt",
      settings: "id",
    });
  }
}

export const db = new MilkTrackerDB();

export const DEFAULT_SETTINGS: Settings = { id: "settings", freezerType: "standard" };

/**
 * Read-only: never writes. Safe to call from `useLiveQuery`, which throws if its
 * querier performs a write (settings are created lazily by `updateSettings` instead).
 */
export async function getSettings(): Promise<Settings> {
  return (await db.settings.get("settings")) ?? DEFAULT_SETTINGS;
}

export async function updateSettings(patch: Partial<Omit<Settings, "id">>) {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await db.settings.put(next);
  return next;
}
