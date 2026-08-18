import { db, getSettings } from "./db";
import type { Entry, Settings } from "./types";

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  settings: Settings;
  entries: Entry[];
}

function downloadBlob(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value: unknown): string {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function exportCSV() {
  const entries = await db.entries.orderBy("date").toArray();
  const headers = [
    "id",
    "date",
    "time",
    "ounces",
    "side",
    "destination",
    "label",
    "notes",
    "usedAt",
    "createdAt",
  ];
  const rows = entries.map((e) =>
    headers.map((h) => csvEscape((e as unknown as Record<string, unknown>)[h])).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob(`milk-tracker-export-${stamp}.csv`, csv, "text/csv");
}

export async function exportJSON() {
  const [entries, settings] = await Promise.all([
    db.entries.toArray(),
    getSettings(),
  ]);
  const payload: BackupPayload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    entries,
  };
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob(
    `milk-tracker-backup-${stamp}.json`,
    JSON.stringify(payload, null, 2),
    "application/json"
  );
}

export async function importJSON(file: File): Promise<{ entryCount: number }> {
  const text = await file.text();
  const data = JSON.parse(text) as BackupPayload;
  if (!data || !Array.isArray(data.entries)) {
    throw new Error("That file doesn't look like a Milk Tracker backup.");
  }
  await db.transaction("rw", db.entries, db.settings, async () => {
    await db.entries.clear();
    await db.entries.bulkAdd(
      data.entries.map((entry) => {
        const rest = { ...entry };
        delete rest.id;
        return rest;
      })
    );
    if (data.settings) {
      await db.settings.put({ ...data.settings, id: "settings" });
    }
  });
  return { entryCount: data.entries.length };
}
