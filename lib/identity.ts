"use client";

import { useSyncExternalStore } from "react";

const UNLOCKED_KEY = "milk-tracker:unlocked";
const CREATED_BY_KEY = "milk-tracker:created-by";

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) listener();
}

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isUnlocked(): boolean {
  return localStorage.getItem(UNLOCKED_KEY) === "true";
}

export function setUnlocked() {
  localStorage.setItem(UNLOCKED_KEY, "true");
  notify();
}

export function getCreatedBy(): string | null {
  return localStorage.getItem(CREATED_BY_KEY);
}

export function setCreatedBy(name: string) {
  localStorage.setItem(CREATED_BY_KEY, name);
  notify();
}

/** SSR-safe: reflects the real value immediately after hydration, `false` before that. */
export function useUnlocked(): boolean {
  return useSyncExternalStore(subscribe, isUnlocked, () => false);
}

/** SSR-safe: reflects the real value immediately after hydration, `null` before that. */
export function useStoredCreatedBy(): string | null {
  return useSyncExternalStore(subscribe, getCreatedBy, () => null);
}
