"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    href: "/aver",
    label: "Agent",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    href: "/studio",
    label: "Builds",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    href: "/proof",
    label: "Proof",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.5C17.25 22.15 21 17.25 21 12V7z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    href: "/pricing",
    label: "Pricing",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22" aria-hidden="true">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
  },
];

export default function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#0a1628]/97 border-t border-[rgba(168,216,240,0.12)] backdrop-blur-md"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Primary navigation"
    >
      <div className="flex items-stretch justify-around">
        {TABS.map((tab) => {
          const active = pathname === tab.href || pathname?.startsWith(tab.href + "/");
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center justify-center gap-1 flex-1 min-h-[56px] py-2 transition-colors ${
                active
                  ? "text-[#818cf8]"
                  : "text-[#a8d8f0]/45 hover:text-[#a8d8f0]/75"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {tab.icon}
              <span className="text-[10px] font-medium tracking-wide">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
