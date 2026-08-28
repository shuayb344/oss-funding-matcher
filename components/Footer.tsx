import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-white/10 bg-white dark:bg-[#0a0a0d] py-10 transition-colors">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-7 w-7 rounded-none p-0.5 border border-emerald-500/50 bg-emerald-500/10 flex items-center justify-center">
                <img src="/logo-transparent.png" alt="FM Logo" className="h-full w-full object-contain" />
              </div>
              <span className="font-mono text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-zinc-100">
                OSS Funding Matcher
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed max-w-xs font-sans">
              Connecting open source infrastructure &amp; maintainers to verified funding programs. Free, open, and data-backed.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-3">
              Product
            </h3>
            <ul className="space-y-2 font-mono text-xs">
              <li>
                <Link href="/about" className="text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  How scoring works
                </Link>
              </li>
              <li>
                <Link href="/funders" className="text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  Browse funders
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-mono text-[11px] font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-500 mb-3">
              Resources
            </h3>
            <ul className="space-y-2 font-mono text-xs">
              <li>
                <a href="https://github.com/ossf/criticality-score" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  OpenSSF Methodology →
                </a>
              </li>
              <li>
                <a href="https://oss.fund" target="_blank" rel="noopener noreferrer" className="text-slate-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                  oss.fund directory →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[11px] text-slate-400 dark:text-zinc-500">
          <span>Built with Next.js, Supabase &amp; Auth.js</span>
          <span>Open source &middot; No tracking &middot; No ads</span>
        </div>
      </div>
    </footer>
  );
}
