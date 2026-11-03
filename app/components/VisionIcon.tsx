import type { CSSProperties } from "react";

export type VisionIconName = "inbox" | "calendar" | "shield" | "check" | "layers" | "proof" | "chat" | "setup" | "switch" | "flag" | "arrow";
export default function VisionIcon({ name, className, style }: { name: VisionIconName; className?: string; style?: CSSProperties }) {
  return <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {name === "inbox" && <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></>}
    {name === "calendar" && <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4m8-4v4M3 10h18"/></>}
    {name === "shield" && <><path d="m12 3 8 3v5c0 5-4 8-8 10-4-2-8-5-8-10V6l8-3Z"/><path d="m8 12 3 3 5-6"/></>}
    {name === "check" && <><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></>}
    {name === "layers" && <><path d="m3 7 9-5 9 5-9 5-9-5Zm0 5 9 5 9-5M3 17l9 5 9-5"/></>}
    {name === "proof" && <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4"/></>}
    {name === "chat" && <path d="M21 11a9 9 0 0 1-9 9 10 10 0 0 1-4-.8L3 21l1.8-5A9 9 0 1 1 21 11Z"/>}
    {name === "setup" && <><path d="m10 2-.6 3-2 .9L4.8 5 2.5 9l2.3 2v2L2.5 15l2.3 4 2.6-.9 2 .9.6 3h4l.6-3 2-.9 2.6.9 2.3-4-2.3-2v-2l2.3-2-2.3-4-2.6.9-2-.9L14 2h-4Z"/><circle cx="12" cy="12" r="3"/></>}
    {name === "switch" && <><rect x="2" y="6" width="20" height="12" rx="6"/><circle cx="16" cy="12" r="3"/></>}
    {name === "flag" && <><path d="M5 21V3c5-4 9 4 14 0v10c-5 4-9-4-14 0"/></>}
    {name === "arrow" && <path d="M4 12h16m-6-6 6 6-6 6"/>}
  </svg>;
}
