import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
// @ts-expect-error Next.js processes global CSS imports at build time.
import "./globals.css";

const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Weather Monitor ESP32",
  description: "Live sensor dashboard for an ESP32 IoT weather station, backed by Supabase.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${inter.variable}`}>
      <body className="min-h-screen font-body antialiased">{children}</body>
    </html>
  );
}