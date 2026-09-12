"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { getPushState, subscribeToPush, type PushState } from "@/lib/push";
import { useCreatedBy } from "@/lib/identity-context";

const noopSubscribe = () => () => {};

function getStandaloneSnapshot(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** SSR-safe: assumes standalone (banner hidden) until the real value is known post-hydration. */
function useStandalone(): boolean {
  return useSyncExternalStore(noopSubscribe, getStandaloneSnapshot, () => true);
}

export default function InstallBanner() {
  const createdBy = useCreatedBy();
  const standalone = useStandalone();
  const [pushState, setPushState] = useState<PushState>("unsupported");
  const [subscribing, setSubscribing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPushState().then(setPushState);
  }, []);

  async function handleEnableAlerts() {
    setSubscribing(true);
    setError(null);
    try {
      await subscribeToPush(createdBy);
      setPushState("subscribed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't enable alerts.");
    } finally {
      setSubscribing(false);
    }
  }

  if (!standalone) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-sm"
        style={{ background: "var(--accent-soft)", color: "var(--foreground)" }}
      >
        <p className="font-medium">Install for alerts to work</p>
        <p className="mt-0.5 text-xs text-foreground-muted">
          Add this to your home screen (Share &rarr; Add to Home Screen on iPhone) so 6-month
          push alerts can reach this device. Notifications from a browser tab alone won&rsquo;t
          arrive on iOS.
        </p>
      </div>
    );
  }

  if (pushState === "unsubscribed") {
    return (
      <div
        className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm"
        style={{ background: "var(--accent-soft)", color: "var(--foreground)" }}
      >
        <div>
          <p className="font-medium">Enable 6-month alerts</p>
          {error && (
            <p className="mt-0.5 text-xs" style={{ color: "var(--danger)" }}>
              {error}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={handleEnableAlerts}
          disabled={subscribing}
          className="shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold disabled:opacity-50"
          style={{ background: "var(--primary)", color: "var(--primary-foreground)" }}
        >
          {subscribing ? "Enabling…" : "Enable"}
        </button>
      </div>
    );
  }

  if (pushState === "denied") {
    return (
      <div
        className="rounded-xl px-4 py-3 text-xs text-foreground-muted"
        style={{ background: "var(--surface-muted)" }}
      >
        Notifications are blocked for this app in your device settings, so 6-month alerts
        won&rsquo;t arrive here. The in-app banner will still show when bags are approaching
        6 months.
      </div>
    );
  }

  return null;
}
