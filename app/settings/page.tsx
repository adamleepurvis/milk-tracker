"use client";

import { useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { getSettings, updateSettings } from "@/lib/db";
import type { FreezerType } from "@/lib/types";
import { exportCSV, exportJSON, importJSON } from "@/lib/backup";

const FREEZER_OPTIONS: { value: FreezerType; label: string; hint: string }[] = [
  { value: "standard", label: "Standard freezer", hint: "Separate door from fridge — best 6 months, ok up to 12" },
  { value: "deep", label: "Deep freezer", hint: "Chest/standalone freezer — good up to 12 months" },
];

export default function SettingsPage() {
  const settings = useLiveQuery(getSettings, []);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFreezerType(value: FreezerType) {
    await updateSettings({ freezerType: value });
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportError(null);
    setImportStatus(null);
    const confirmed = window.confirm(
      "Importing will replace all data currently on this device with the contents of the backup file. Continue?"
    );
    if (!confirmed) {
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    try {
      const result = await importJSON(file);
      setImportStatus(`Imported ${result.entryCount} entries. This replaced your previous local data.`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Import failed.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  if (!settings) {
    return <div className="flex-1 px-5 pt-8 text-foreground-muted">Loading…</div>;
  }

  return (
    <div className="flex flex-1 flex-col gap-8 px-5 pb-6 pt-8">
      <header>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
      </header>

      <section>
        <h2 className="mb-3 text-sm font-semibold text-foreground">Freezer type</h2>
        <p className="mb-3 text-xs text-foreground-muted">
          Used to calculate storage-life guidance for freezer entries in your inventory.
        </p>
        <div className="flex flex-col gap-2">
          {FREEZER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => handleFreezerType(opt.value)}
              className="rounded-xl border px-4 py-3 text-left transition-colors"
              style={{
                borderColor: settings.freezerType === opt.value ? "var(--primary)" : "var(--border)",
                background: settings.freezerType === opt.value ? "var(--primary-soft)" : "var(--surface)",
              }}
              aria-pressed={settings.freezerType === opt.value}
            >
              <div className="text-sm font-medium text-foreground">{opt.label}</div>
              <div className="mt-0.5 text-xs text-foreground-muted">{opt.hint}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-1 text-sm font-semibold text-foreground">Backup &amp; restore</h2>
        <p className="mb-3 text-xs text-foreground-muted">
          All data lives only on this device. Export regularly, especially before switching phones.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => exportJSON()}
            className="rounded-xl py-3 text-sm font-medium"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Export backup (JSON)
          </button>
          <button
            type="button"
            onClick={() => exportCSV()}
            className="rounded-xl border border-border bg-surface py-3 text-sm font-medium text-foreground"
          >
            Export as CSV
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-xl border border-border bg-surface py-3 text-sm font-medium text-foreground"
          >
            Import from backup (JSON)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            onChange={handleImport}
            className="hidden"
          />
          {importStatus && <p className="text-xs" style={{ color: "var(--success)" }}>{importStatus}</p>}
          {importError && <p className="text-xs" style={{ color: "var(--danger)" }}>{importError}</p>}
        </div>
      </section>

      <section className="text-xs text-foreground-muted">
        <p>Milk Tracker stores everything locally on this device. There is no account, cloud sync, or server.</p>
      </section>
    </div>
  );
}
