"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import {
  ArrowRight,
  Link2,
  Search,
  Send,
  Shield,
  Zap,
  ChevronDown,
  HelpCircle,
  Database,
  Coins,
  Activity,
} from "lucide-react";

interface Funder {
  id: string;
  name: string;
  description: string;
  amount_range: string;
  focus_tags: string[];
  application_type: string;
  eligibility_notes: string;
  application_url: string | null;
  region_restriction: string | null;
}

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

function getHighestGrantDisplay(fundersList: Funder[]): string {
  if (!fundersList.length) return "$900,000";
  let maxVal = 0;
  let maxStr = "";

  for (const f of fundersList) {
    if (!f.amount_range) continue;
    const matches = f.amount_range.match(/[\$€]?\d{1,3}(?:,\d{3})+/g);
    if (matches) {
      for (const match of matches) {
        const num = parseInt(match.replace(/[^\d]/g, ""), 10);
        if (num > maxVal) {
          maxVal = num;
          maxStr = match.startsWith("€")
            ? `€${num.toLocaleString()}`
            : `$${num.toLocaleString()}`;
        }
      }
    }
  }

  return maxStr || "$900,000";
}

const FAQS = [
  {
    question: "Is this free?",
    answer:
      "Yes, OSS Funding Matcher is 100% free for open source maintainers and contributors. There are no credit cards required, no hidden tier fees, and no charge for evaluating repositories or generating pitch drafts.",
  },
  {
    question: "What's a criticality score?",
    answer:
      "Derived from the Open Source Security Foundation (OpenSSF) Criticality Score project, it is an algorithmic metric (from 0.0 to 1.0) that measures a repository's activity, ecosystem impact, contributor density, and dependency influence to quantify project importance.",
  },
  {
    question: "Does this submit applications for me?",
    answer:
      "No. OSS Funding Matcher evaluates program eligibility and synthesizes tailored pitch drafts for you to review and edit. Because several funders operate nomination programs, open call LOIs, or custom application forms, you retain full control to submit the final pitch directly.",
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const { data: funders = [] } = useQuery<Funder[]>({
    queryKey: ["funders"],
    queryFn: () =>
      fetch("/api/funders")
        .then((res) => res.json())
        .then((d) => d.funders || []),
  });

  const maxGrantDisplay = getHighestGrantDisplay(funders);
  const funderListForMarquee =
    funders.length > 0
      ? funders
      : [
        { id: "1", name: "GitHub Secure Open Source Fund" },
        { id: "2", name: "Sovereign Tech Fund" },
        { id: "3", name: "Alpha-Omega" },
        { id: "4", name: "FLOSS/fund" },
        { id: "5", name: "NLnet Foundation" },
        { id: "6", name: "Open Technology Fund" },
      ];

  const marqueeItems = [...funderListForMarquee, ...funderListForMarquee];

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  return (
    <div className="flex flex-col flex-1 bg-transparent">
      {/* Hero Section */}
      <section className="relative border-b border-slate-200 dark:border-white/10 pt-20 pb-20 sm:pb-24 bg-transparent">
        {/* Local Accent Particles */}
        <div className="absolute bottom-10 left-1/4 w-1.5 h-1.5 bg-emerald-500 animate-particle-1 pointer-events-none z-0" />
        <div className="absolute bottom-20 left-2/3 w-2 h-2 bg-emerald-500 animate-particle-2 pointer-events-none z-0" />
        <div className="absolute bottom-5 right-1/4 w-1.5 h-1.5 bg-violet-500 animate-particle-3 pointer-events-none z-0" />

        <div className="mx-auto max-w-4xl text-center px-3.5 sm:px-6 relative z-10">
          {/* Square Tag Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] backdrop-blur-xl px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-widest text-slate-600 dark:text-zinc-300 shadow-sm dark:shadow-none">
            <span className="h-1.5 w-1.5 bg-emerald-500 rounded-none inline-block animate-pulse" />
            [ FREE &middot; NO CREDIT CARD &middot; OPEN SOURCE ]
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl leading-[1.05] font-sans">
            Your open source project
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-800 via-emerald-700 to-emerald-600 dark:from-white dark:via-zinc-200 dark:to-emerald-400">
              deserves real funding.
            </span>
          </h1>

          <p className="mt-8 text-base sm:text-lg leading-relaxed text-slate-600 dark:text-zinc-400 max-w-xl mx-auto font-sans font-normal">
            Connect your GitHub repositories. We calculate OpenSSF criticality scores, match you with verified funding programs, and generate pitch drafts ready for submission.
          </p>

          {/* Primary CTA Buttons */}
          <div className="mt-10 flex flex-col items-center gap-4">
            {status === "authenticated" ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-none bg-emerald-500 border border-emerald-400 px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
              >
                GO TO DASHBOARD
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <button
                onClick={() => signIn("github")}
                className="inline-flex items-center gap-3 rounded-none bg-emerald-500 border border-emerald-400 px-8 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-400 hover:shadow-[0_0_20px_rgba(34,197,94,0.4)] transition-all"
              >
                <GithubIcon className="h-4 w-4 text-black" />
                CONNECT WITH GITHUB
              </button>
            )}
            <p className="font-mono text-[11px] text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
              No write permissions requested &middot; Read-only repository access
            </p>
          </div>
        </div>
      </section>

      {/* 1. INFINITE MARQUEE — Verified Funder Wordmark Strip */}
      <section className="relative py-8 border-b border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-black/30 backdrop-blur-sm overflow-hidden">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 mb-3 text-center">
          <span className="font-mono text-[11px] uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            // Verified funding programs
          </span>
        </div>

        {/* Marquee Wrapper with Side Fades */}
        <div className="relative w-full overflow-hidden py-2">
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-10 bg-gradient-to-r from-slate-50 dark:from-[#0a0a0d] to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-10 bg-gradient-to-l from-slate-50 dark:from-[#0a0a0d] to-transparent" />

          <div className="animate-marquee flex gap-3.5 px-4 items-center">
            {marqueeItems.map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="shrink-0 rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] px-4 py-2 font-mono text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors shadow-sm dark:shadow-none"
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2a. STATS STRIP — Live Database Numbers */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-12 border-b border-slate-200 dark:border-white/10 w-full">
        <div className="grid gap-4 sm:grid-cols-3 items-stretch">
          {/* Stat 1 */}
          <div className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-6 shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between h-full">
            <div className="flex items-start gap-3.5 mb-4 min-h-[68px]">
              <div className="h-10 w-10 shrink-0 rounded-none border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Database className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 block mb-0.5">
                  ACTIVE REGISTRY
                </span>
                <div className="font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                  {funders.length || 13} Verified Programs
                </div>
              </div>
            </div>
            <p className="font-mono text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-white/[0.05] pt-3 mt-auto">
              Direct, nomination &amp; manifest grants
            </p>
          </div>

          {/* Stat 2 */}
          <div className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-6 shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between h-full">
            <div className="flex items-start gap-3.5 mb-4 min-h-[68px]">
              <div className="h-10 w-10 shrink-0 rounded-none border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Coins className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 block mb-0.5">
                  MAXIMUM GRANT
                </span>
                <div className="font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                  Up to {maxGrantDisplay} per grant
                </div>
              </div>
            </div>
            <p className="font-mono text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-white/[0.05] pt-3 mt-auto">
              Cited live from registry database
            </p>
          </div>

          {/* Stat 3 */}
          <div className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-6 shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between h-full">
            <div className="flex items-start gap-3.5 mb-4 min-h-[68px]">
              <div className="h-10 w-10 shrink-0 rounded-none border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Activity className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <span className="font-mono text-[11px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 block mb-0.5">
                  EVALUATION MODEL
                </span>
                <div className="font-sans text-lg font-bold tracking-tight text-slate-900 dark:text-white leading-snug">
                  0.0 to 1.0 OpenSSF Score
                </div>
              </div>
            </div>
            <p className="font-mono text-xs text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-white/[0.05] pt-3 mt-auto">
              Objective criticality ranking
            </p>
          </div>
        </div>
      </section>

      {/* Asymmetric 3-Step How-It-Works Grid */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 py-20 bg-transparent">
        <div className="mb-12">
          <div className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
            // System Workflow
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans sm:text-3xl">
            How OSS Funding Matcher Works
          </h2>
          <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 font-sans max-w-lg">
            An automated three-stage pipeline to quantify criticality and match your software with active grant programs.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3 relative">
          {/* Hairline connecting line across cards on desktop */}
          <div className="hidden sm:block absolute top-1/2 left-0 right-0 h-px bg-slate-200 dark:bg-white/10 -z-10 -translate-y-6" />

          {/* Step 1 */}
          <div className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-6 hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between shadow-sm dark:shadow-none">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-none border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-widest">
                  [ 01 ]
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white font-sans">
                Sync Repositories
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
                One-click sync with your GitHub account fetches public commits, contributors, stars, and issue activity.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 font-mono text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              FETCH_REPOS_API
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-6 hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between shadow-sm dark:shadow-none">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-none border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Search className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-widest">
                  [ 02 ]
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white font-sans">
                Score &amp; Match
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
                OpenSSF algorithm scores criticality. Our engine matches your project against active grants and foundation funds.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 font-mono text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              OPENSSF_CRITICALITY_EVAL
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-6 hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between shadow-sm dark:shadow-none">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-10 w-10 rounded-none border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Send className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs font-bold text-slate-400 dark:text-zinc-500 tracking-widest">
                  [ 03 ]
                </span>
              </div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-white font-sans">
                Generate Pitches
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
                AI generates customized pitch drafts tailored to each funder&apos;s specific criteria and mission.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 font-mono text-[10px] text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
              LLM_PITCH_SYNTHESIS
            </div>
          </div>
        </div>
      </section>

      {/* Proof / Security Banner */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-16 bg-transparent">
        <div className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm dark:shadow-none">
          <div className="flex items-start gap-4">
            <div className="h-10 w-10 shrink-0 rounded-none border border-emerald-500/40 bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
                Open &amp; Transparent Scoring Algorithm
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400 font-sans leading-relaxed max-w-lg">
                We use the Open Source Security Foundation (OpenSSF) Criticality Score project to evaluate project weight objectively.
              </p>
            </div>
          </div>

          <Link
            href="/about"
            className="shrink-0 inline-flex items-center gap-2 rounded-none border border-slate-300 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] px-5 py-2.5 font-mono text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:border-emerald-500/40 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all uppercase tracking-wider"
          >
            VIEW METHODOLOGY
            <Link2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
          </Link>
        </div>
      </section>

      {/* 2b. FAQ SECTION — Smooth Accordion Before Footer */}
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 bg-transparent">
        <div className="mb-8">
          <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            <HelpCircle className="h-3.5 w-3.5" />
            // Frequently Asked Questions
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans sm:text-3xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-1 font-mono text-xs text-slate-500 dark:text-zinc-400 uppercase">
            Everything you need to know about OSS Funding Matcher
          </p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;

            return (
              <div
                key={index}
                className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl shadow-sm dark:shadow-none overflow-hidden transition-colors"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-4 sm:px-6 py-4 flex items-start justify-between gap-3 text-left focus:outline-none group"
                >
                  <span className="text-sm font-semibold text-slate-900 dark:text-white font-sans flex items-start gap-2.5 sm:gap-3">
                    <span className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap shrink-0 pt-0.5">
                      [ 0{index + 1} ]
                    </span>
                    <span className="leading-snug">{faq.question}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 dark:text-zinc-500 group-hover:text-emerald-500 transition-transform duration-300 shrink-0 mt-0.5 ${isOpen ? "rotate-180 text-emerald-600 dark:text-emerald-400" : ""
                      }`}
                  />
                </button>

                {/* Smooth CSS Grid Height Transition */}
                <div
                  className={`grid transition-all duration-200 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                >
                  <div className="overflow-hidden px-6 font-sans text-xs text-slate-600 dark:text-zinc-300 leading-relaxed border-t border-slate-100 dark:border-white/[0.05]">
                    <div className="pt-3 pb-5">{faq.answer}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
