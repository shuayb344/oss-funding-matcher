"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col flex-1">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[800px] rounded-full bg-gradient-to-b from-emerald-500/10 via-blue-500/5 to-transparent blur-3xl" />
        </div>

        <div className="mx-auto max-w-2xl text-center px-6 pt-28 pb-20">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Free &middot; No credit card &middot; Open source
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-zinc-100 sm:text-5xl leading-[1.1]">
            Your OSS project
            <br />
            deserves funding.
          </h1>

          <p className="mt-6 text-lg leading-relaxed text-zinc-400 max-w-lg mx-auto">
            Connect your GitHub repos. We analyze their criticality, match you
            against real funding programs, and draft your application — ready to
            send.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4">
            {status === "authenticated" ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-all"
              >
                Go to Dashboard
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </Link>
            ) : (
              <button
                onClick={() => signIn("github")}
                className="group inline-flex items-center gap-2.5 rounded-full bg-white px-6 py-3 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-all"
              >
                <svg
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Sign in with GitHub
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                  />
                </svg>
              </button>
            )}
            <p className="text-xs text-zinc-600">
              We only request read access to your public repos.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-zinc-800/50 bg-zinc-900/20">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-500 text-center mb-10">
            How it works
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Connect",
                desc: "Sign in with GitHub. We fetch your public repos and analyze each one.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m9.86-4.274a4.5 4.5 0 0 0-1.242-7.244l-4.5-4.5a4.5 4.5 0 0 0-6.364 6.364L5.25 8.5" />
                  </svg>
                ),
              },
              {
                step: "2",
                title: "Match",
                desc: "AI scores your projects against 18+ verified funding programs — with honest reasoning.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                ),
              },
              {
                step: "3",
                title: "Apply",
                desc: "Get a tailored pitch draft — copy, edit, and send to the funder yourself.",
                icon: (
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                  </svg>
                ),
              },
            ].map((item, i) => (
              <div key={item.step} className="relative">
                {i < 2 && (
                  <div className="hidden sm:block absolute top-6 left-full w-full h-px bg-gradient-to-r from-zinc-800 to-transparent" />
                )}
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 h-full">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800/80 text-zinc-400">
                    {item.icon}
                  </div>
                  <h3 className="text-sm font-semibold text-zinc-200">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-500 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="border-t border-zinc-800/50">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Methodology
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Criticality scoring based on OpenSSF&apos;s published, open
                methodology — reimplemented in JavaScript for serverless
                compatibility.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/30 p-5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-2">
                Honest framing
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We don&apos;t auto-submit applications. Most funders use
                nomination or open calls — we give you a ready-to-send pitch, not
                a false promise.
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
