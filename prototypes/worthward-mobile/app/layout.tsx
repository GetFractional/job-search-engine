import type { Metadata } from "next";
import "./globals.css";
import "./way-ahead-v3.css";

export const metadata: Metadata = {
  title: "Way Ahead | Find work that moves your life forward",
  description: "Reveal credible career paths, find better-fit jobs, and prepare your strongest honest pursuit.",
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
