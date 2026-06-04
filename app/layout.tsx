import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Micro Titan — AI Helpers for Real Life",
  description: "Personal AI assistants delivered via SMS. Fitness coach, financial tracker, language tutor, business manager — each one knows your goals and replies the moment you text.",
  keywords: ["AI assistant", "SMS AI", "personal AI", "AI helpers", "business AI", "fitness coach AI"],
  openGraph: {
    title: "Micro Titan — AI Helpers for Real Life",
    description: "Choose an AI helper built for your life. Available by text, 24/7.",
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
