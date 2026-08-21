import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { Analytics } from "@vercel/analytics/react";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "OSS Funding Matcher — Find funding for your open source project",
    template: "%s | OSS Funding Matcher",
  },
  description:
    "Connect your GitHub repos to real funding programs. Get AI-matched grants, sponsorships, and funding opportunities for your open source project.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://oss-funding-matcher.vercel.app"
  ),
  openGraph: {
    title: "OSS Funding Matcher",
    description:
      "Connect your GitHub repos to real funding programs. AI-matched grants, sponsorships, and funding opportunities.",
    type: "website",
    siteName: "OSS Funding Matcher",
  },
  twitter: {
    card: "summary_large_image",
    title: "OSS Funding Matcher",
    description:
      "Connect your GitHub repos to real funding programs. AI-matched grants, sponsorships, and funding opportunities.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#09090b" />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 dark:bg-zinc-950 dark:text-zinc-100 light:bg-white light:text-zinc-900">
        <ThemeProvider>
          <SessionProvider>
            <Navbar />
            <main className="flex-1 pt-14">{children}</main>
            <Footer />
          </SessionProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
