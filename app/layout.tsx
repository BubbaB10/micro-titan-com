import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Micro Titan — AI tools that run your life.",
  description: "We build the agents. You keep the life. Six AI tools for the parts of life most people just wing it through.",
  keywords: ["AI tools", "AI agents", "Micro Titan", "missed call AI", "AI bookkeeper", "AI estimator", "car wash marketplace", "rescue social"],
  openGraph: {
    title: "Micro Titan — AI tools that run your life.",
    description: "We build the agents. You keep the life.",
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
