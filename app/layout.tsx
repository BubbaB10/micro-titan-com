import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";
import BottomTabBar from "./components/BottomTabBar";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Micro Titan — Provable software, end to end.",
  description: "We build your app or OS — and hand you the AI agent that runs it. Gate-verified either way. Aver is the provable AI chief-of-staff from Paris, Texas.",
  keywords: ["Micro Titan", "Aver", "provable AI agent", "verifiable AI", "AI chief of staff", "The Studio", "AI app builder", "Paris Texas", "Fairway Bets", "Mineral Ledger"],
  openGraph: {
    title: "Micro Titan — Provable software, end to end.",
    description: "We build your app or OS — and hand you the AI agent that runs it. Gate-verified either way.",
    url: "https://micro-titan.com",
    siteName: "Micro Titan",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={mulish.variable}>
      {/* pb-24 on mobile leaves room for the fixed bottom tab bar (56px bar + safe-area) */}
      <body className="antialiased pb-24 lg:pb-0">
        {children}
        <BottomTabBar />
      </body>
    </html>
  );
}
