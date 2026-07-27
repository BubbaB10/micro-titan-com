import type { Metadata } from "next";
import { Mulish } from "next/font/google";
import "./globals.css";

const mulish = Mulish({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-mulish",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Micro Titan — AI-native ventures from Paris, Texas",
  description: "One operator. Seven AI-powered ventures. Building software, hospitality, real estate, and sports products from Paris, Texas.",
  keywords: ["Micro Titan", "AI ventures", "Fairway Bets", "Aver AI", "Aver agent", "PGCC", "Paris Texas", "provable AI agent", "verifiable AI", "AI chief of staff", "Mineral Ledger"],
  openGraph: {
    title: "Micro Titan — AI-native ventures from Paris, Texas",
    description: "One operator. Seven AI-powered ventures. Building from Paris, Texas.",
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
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
