"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "Add", icon: DropIcon },
  { href: "/inventory", label: "Freezer", icon: SnowflakeIcon },
  { href: "/history", label: "History", icon: ListIcon },
  { href: "/settings", label: "Settings", icon: GearIcon },
] as const;

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky bottom-0 z-20 border-t border-border bg-(--nav-bg) pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <ul className="flex">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className="flex flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors"
                style={{ color: active ? "var(--primary)" : "var(--foreground-muted)" }}
                aria-current={active ? "page" : undefined}
              >
                <Icon active={active} />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

type IconProps = { active: boolean };

function DropIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3s7 7.5 7 12a7 7 0 1 1-14 0c0-4.5 7-12 7-12Z"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SnowflakeIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity={active ? 1 : 0.9}>
        <path d="M12 3v18M4.5 7.5l15 9M19.5 7.5l-15 9" />
      </g>
    </svg>
  );
}

function ListIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <g stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
        <path d="M8 6h12M8 12h12M8 18h12" />
        <circle cx="4" cy="6" r="1.3" fill={active ? "currentColor" : "none"} />
        <circle cx="4" cy="12" r="1.3" fill={active ? "currentColor" : "none"} />
        <circle cx="4" cy="18" r="1.3" fill={active ? "currentColor" : "none"} />
      </g>
    </svg>
  );
}

function GearIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle
        cx="12"
        cy="12"
        r="3.2"
        fill={active ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 3.5v2M12 18.5v2M20.5 12h-2M5.5 12h-2M17.8 6.2l-1.4 1.4M7.6 16.4l-1.4 1.4M17.8 17.8l-1.4-1.4M7.6 7.6 6.2 6.2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
