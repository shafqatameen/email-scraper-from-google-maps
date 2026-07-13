import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Maps Email Scraper — Find Business Contacts from Google Maps",
  description:
    "Extract emails, phone numbers, websites and full business details from Google Maps listings. Real-time streaming results with CSV and Excel export.",
  keywords: ["google maps scraper", "email extractor", "business leads", "contact finder"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
