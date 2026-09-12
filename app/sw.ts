import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry } from "serwist";
import { Serwist } from "serwist";

interface PushPayload {
  title?: string;
  body?: string;
  url?: string;
}

interface SWPushEvent {
  data: { json: () => PushPayload } | null;
  waitUntil: (p: Promise<unknown>) => void;
}

interface SWNotificationClickEvent {
  notification: { close: () => void; data?: { url?: string } };
  waitUntil: (p: Promise<unknown>) => void;
}

declare const self: {
  __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  addEventListener(type: "push", listener: (event: SWPushEvent) => void): void;
  addEventListener(type: "notificationclick", listener: (event: SWNotificationClickEvent) => void): void;
  registration: {
    showNotification(
      title: string,
      options?: { body?: string; icon?: string; badge?: string; data?: unknown }
    ): Promise<void>;
  };
  clients: {
    matchAll(options?: { type?: "window"; includeUncontrolled?: boolean }): Promise<{ url: string; focus(): void }[]>;
    openWindow(url: string): Promise<unknown>;
  };
};

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
});

serwist.addEventListeners();

// 6-month-approaching alerts, pushed by the Supabase Edge Function cron.
self.addEventListener("push", (event) => {
  const payload = event.data?.json() ?? {};
  const title = payload.title ?? "Milk Tracker";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: payload.body ?? "A stored bag is approaching 6 months old.",
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: payload.url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url ?? "/";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
      for (const client of clientsList) {
        if (client.url.includes(url)) {
          client.focus();
          return;
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
