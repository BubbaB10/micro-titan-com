import type { Metadata } from "next";
import "./globals.css";
import BottomTabBar from "./components/BottomTabBar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Organization structured data.
 *
 * The public offering is remote and nationwide. This block does not publish a city,
 * a street address, or a telephone number. Do not add a personal phone, a personal
 * email, or a Twilio number. The only contact is hello@micro-titan.com.
 */
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://micro-titan.com/#organization",
  name: "Micro Titan",
  legalName: "Micro Titan LLC",
  url: "https://micro-titan.com",
  email: "hello@micro-titan.com",
  description:
    "Micro Titan wires an agent into real work, proves each job with a record, and keeps operating it. Custom apps, websites, and marketing are supporting services. Remote, nationwide.",
  areaServed: { "@type": "Country", name: "United States" },
  knowsAbout: [
    "custom business software",
    "business operating systems",
    "verifiable AI agents",
  ],
};

export const metadata: Metadata = {
  // Without metadataBase, Next resolves the relative OG/Twitter image paths below against
  // localhost at build time and warns. Set explicitly so social cards work from production.
  metadataBase: new URL("https://micro-titan.com"),
  title: "Micro Titan — Custom Software, Automation & Practical AI Help",
  description: "Custom software and automation for small businesses, plus practical AI setup and hands-on guidance for individuals. An assistant is scoped in where it helps, not assumed. Remote, nationwide. Websites and monthly care are available separately: $2,500 setup + $750/month.",
  keywords: ["Micro Titan", "custom business software", "business automation", "AI tool setup", "AI help", "business operations software", "small business websites", "local SEO", "Fairway Bets", "Mineral Ledger"],
  openGraph: {
    title: "Micro Titan — Custom Software, Automation & Practical AI Help",
    description: "Custom software and automation for small businesses, plus practical AI setup and hands-on guidance for individuals.",
    url: "https://micro-titan.com",
    siteName: "Micro Titan",
    type: "website",
    images: [{ url: "/icons/og-image.png", width: 1200, height: 630, alt: "Micro Titan" }],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/icons/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Structured data. Rendered server-side so crawlers see it without executing JS. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }}
        />
      </head>
      {/* pb-24 on mobile leaves room for the fixed bottom tab bar (56px bar + safe-area) */}
      <body className="antialiased pb-24 lg:pb-0">
        {children}
        <BottomTabBar />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
