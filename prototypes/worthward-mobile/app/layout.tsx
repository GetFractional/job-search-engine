import type { Metadata } from "next";
import "./globals.css";
import "./production.css";

export const metadata: Metadata = {
  title: "Way Ahead | Your next job, pursued with evidence",
  description: "Find work worth pursuing, understand the real fit, and prepare a stronger, claim-safe application.",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
