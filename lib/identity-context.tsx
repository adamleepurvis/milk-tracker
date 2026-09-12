"use client";

import { createContext, useContext } from "react";

const IdentityContext = createContext<string | null>(null);

export const IdentityProviderValue = IdentityContext.Provider;

export function useCreatedBy(): string {
  const value = useContext(IdentityContext);
  if (!value) {
    throw new Error("useCreatedBy() called outside of HouseholdGate");
  }
  return value;
}
