"use client";

import { useState } from "react";
import { setCreatedBy, setUnlocked, useStoredCreatedBy, useUnlocked } from "@/lib/identity";
import { IdentityProviderValue } from "@/lib/identity-context";

const NAME_OPTIONS = ["Dad", "Mom"];
const PASSCODE = process.env.NEXT_PUBLIC_HOUSEHOLD_PASSCODE ?? "";

export default function HouseholdGate({ children }: { children: React.ReactNode }) {
  const unlocked = useUnlocked();
  const createdBy = useStoredCreatedBy();
  const [passcodeInput, setPasscodeInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [customName, setCustomName] = useState("");

  function handlePasscodeSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (passcodeInput === PASSCODE) {
      setUnlocked();
      setError(null);
    } else {
      setError("Wrong passcode.");
    }
  }

  function chooseName(name: string) {
    if (!name.trim()) return;
    setCreatedBy(name.trim());
  }

  if (!unlocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Milk Tracker</h1>
          <p className="mt-1 text-sm text-foreground-muted">Enter the household passcode</p>
        </div>
        <form onSubmit={handlePasscodeSubmit} className="flex w-full max-w-xs flex-col gap-3">
          <input
            type="password"
            inputMode="text"
            autoFocus
            value={passcodeInput}
            onChange={(e) => setPasscodeInput(e.target.value)}
            className="w-full rounded-2xl border border-border bg-surface px-4 py-4 text-center text-lg outline-none focus:border-primary"
            placeholder="Passcode"
          />
          {error && <p className="text-center text-sm" style={{ color: "var(--danger)" }}>{error}</p>}
          <button
            type="submit"
            className="w-full rounded-2xl py-4 text-base font-semibold"
            style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
          >
            Unlock
          </button>
        </form>
      </div>
    );
  }

  if (!createdBy) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-foreground">Who&rsquo;s this?</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            So entries show who logged them. You can&rsquo;t change this later without clearing app data.
          </p>
        </div>
        <div className="flex w-full max-w-xs flex-col gap-3">
          {NAME_OPTIONS.map((name) => (
            <button
              key={name}
              onClick={() => chooseName(name)}
              className="w-full rounded-2xl border border-border bg-surface py-4 text-base font-medium text-foreground"
            >
              {name}
            </button>
          ))}
          <div className="flex gap-2">
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Other name"
              className="min-w-0 flex-1 rounded-2xl border border-border bg-surface px-4 py-3 text-sm outline-none focus:border-primary"
            />
            <button
              onClick={() => chooseName(customName)}
              disabled={!customName.trim()}
              className="shrink-0 rounded-2xl px-4 py-3 text-sm font-medium disabled:opacity-40"
              style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
            >
              Use
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <IdentityProviderValue value={createdBy}>{children}</IdentityProviderValue>;
}
