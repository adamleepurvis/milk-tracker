import type { Metadata, Viewport } from "next";
import { SerwistProvider } from "@serwist/next/react";
import HouseholdGate from "@/components/HouseholdGate";
import "./globals.css";

export const metadata: Metadata = {
  title: "Milk Tracker",
  description: "Shared log of breast milk pumping sessions and freezer inventory for two devices.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Milk Tracker",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f5" },
    { media: "(prefers-color-scheme: dark)", color: "#221f2b" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body
        className="flex h-full min-h-screen flex-col antialiased"
        style={{ fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif" }}
      >
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === "development"}>
          <HouseholdGate>
            <main className="mx-auto flex w-full max-w-md flex-1 flex-col">{children}</main>
          </HouseholdGate>
        </SerwistProvider>
      </body>
    </html>
  );
}
