import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Micro Titan — AI-native ventures from Paris, Texas",
  description: "One operator. Seven AI-powered ventures. Building software, hospitality, real estate, and sports products from Paris, Texas.",
  keywords: ["Micro Titan", "AI ventures", "Fairway Bets", "Greg AI", "PGCC", "Paris Texas", "AI chief of staff", "Mineral Ledger"],
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
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
