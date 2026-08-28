import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Analytics } from "@vercel/analytics/react";
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
  icons: {
    icon: "/logo-transparent.png",
  },
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <meta name="theme-color" content="#0a0a0d" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('oss-funding-theme');var t=s?JSON.parse(s).state.theme:'dark';document.documentElement.classList.remove('dark','light');document.documentElement.classList.add(t);}catch(e){document.documentElement.classList.add('dark');}})();`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#0a0a0d] text-slate-900 dark:text-zinc-100 antialiased relative selection:bg-emerald-500/30 selection:text-emerald-300">
        {/* Global Moving Grid & Ambient Radial Light Background */}
        <div className="fixed inset-0 -z-50 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 animate-grid-drift opacity-80" />
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-emerald-500/10 dark:bg-emerald-500/10 blur-[130px] rounded-none animate-blob-1" />
          <div className="absolute top-1/3 left-1/4 w-[550px] h-[380px] bg-violet-500/10 dark:bg-violet-600/10 blur-[130px] rounded-none animate-blob-2" />
        </div>

        <Providers>
          <Navbar />
          <main className="flex-1 pt-14">{children}</main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
