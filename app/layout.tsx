import type { Metadata } from "next";
import "./globals.css";
import BottomTabBar from "./components/BottomTabBar";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * LocalBusiness structured data — added 2026-09-19.
 *
 * Measured that day: micro-titan.com served ZERO JSON-LD blocks, while the competitor we intend to
 * displace (Hibu, for Nu-Tek Foundation Solutions) ships LocalBusiness with PostalAddress,
 * GeoCoordinates and OpeningHoursSpecification. Selling local search from a site with no structured
 * data is a position that does not survive the first question.
 *
 * ⚠️ NO STREET ADDRESS, DELIBERATELY. The address on file for this business is a private residence.
 * A street address measurably helps local ranking, and publishing a home is irreversible once
 * crawled — so that is the OWNER'S decision, not a default. If Micro Titan takes a commercial
 * address or opens a Google Business Profile, add `streetAddress` + `postalCode` here and point
 * `sameAs` at the GBP.
 *
 * ⚠️ NO `telephone`. There is no business number on this site today. Do not invent one: an
 * inconsistent NAP (name / address / phone) across the web actively damages local ranking, which
 * is the exact service being sold.
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
    "Micro Titan builds and runs the software a small business needs — operations apps, websites and local search — with mechanical verification behind every change.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Paris",
    addressRegion: "TX",
    addressCountry: "US",
  },
  areaServed: [
    { "@type": "AdministrativeArea", name: "Northeast Texas" },
    { "@type": "Country", name: "United States" },
  ],
  knowsAbout: [
    "custom business software",
    "business operating systems",
    "local search optimization",
    "verifiable AI agents",
  ],
};

export const metadata: Metadata = {
  // Without metadataBase, Next resolves the relative OG/Twitter image paths below against
  // localhost at build time and warns. Set explicitly so social cards work from production.
  metadataBase: new URL("https://micro-titan.com"),
  title: "Micro Titan — Business Software, Operations & Digital Services",
  description: "Custom business software and operations for small businesses, with an assistant built in — plus a website we build and keep running. Based in Paris, Texas. Website and monthly care: $2,500 setup + $750/month.",
  // "social media" removed: it is on the not-yet list, and a keyword is a claim about what we do.
  keywords: ["Micro Titan", "custom business software", "business operations software", "small business websites", "local SEO", "Northeast Texas", "Paris Texas", "Fairway Bets", "Mineral Ledger"],
  openGraph: {
    title: "Micro Titan — Business Software, Operations & Digital Services",
    description: "Custom business software and operations for small businesses, with an assistant built in, plus websites and local search.",
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
