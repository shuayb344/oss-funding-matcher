"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { ArrowRight, Link2, Search, Send, Shield, Zap } from "lucide-react";

function GithubIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col flex-1 bg-transparent">
      {/* Hero Section */}
      <section className="relative border-b border-slate-200 dark:border-white/10 pt-20 pb-20 sm:pb-28 bg-transparent">
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
      <section className="mx-auto max-w-5xl px-4 sm:px-6 pb-20 bg-transparent">
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
    </div>
  );
}
