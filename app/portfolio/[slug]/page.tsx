import { redirect } from "next/navigation";

// /portfolio/[slug] is retired — permanent redirect handled in next.config.ts.
// This component is a belt-and-suspenders fallback in case the config-level redirect
// doesn't intercept (e.g. dev mode or edge case with static generation).
export function generateStaticParams() {
  return [];
}

export default function VenturePage() {
  redirect("/about");
}
