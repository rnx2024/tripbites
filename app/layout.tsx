// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TripBites - Travel Intelligence for City Briefs",
  description: "TripBites helps travelers get fast local briefings based on weather, recent developments, and disruption-aware backend analysis.",
  icons: {
    icon: "/smart-news-logo.svg",
  },
};

export default function RootLayout(
  { children }: Readonly<{ children: React.ReactNode }>
) {

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
