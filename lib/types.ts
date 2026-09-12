export type EntryStatus = "stored" | "used";

export interface MilkEntry {
  id: string;
  date_pumped: string; // YYYY-MM-DD
  ounces: number;
  status: EntryStatus;
  used_at: string | null; // ISO timestamp
  created_by: string;
  created_at: string; // ISO timestamp
  notified_at: string | null; // ISO timestamp; set once a 6-month push has gone out
}

export interface PushSubscriptionRow {
  id: string;
  created_by: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}
