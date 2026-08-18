export type Side = "left" | "right" | "both" | "n/a";
export type Destination = "fridge" | "freezer" | "fresh";
export type FreezerType = "standard" | "deep";

export interface Entry {
  id?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  ounces: number;
  side: Side;
  destination: Destination;
  label?: string;
  notes?: string;
  /** Set when the entry has been consumed/used and removed from active inventory. */
  usedAt?: string; // ISO timestamp
  createdAt: string; // ISO timestamp, for stable ordering
}

export interface Settings {
  id: "settings";
  freezerType: FreezerType;
}

export const DESTINATION_LABELS: Record<Destination, string> = {
  fridge: "Fridge",
  freezer: "Freezer",
  fresh: "Fed Fresh",
};

export const SIDE_LABELS: Record<Side, string> = {
  left: "Left",
  right: "Right",
  both: "Both",
  "n/a": "N/A",
};
