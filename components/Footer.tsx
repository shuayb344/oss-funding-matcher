import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-800 dark:border-zinc-800 light:border-zinc-200 py-8">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Brand */}
          <div>
            <span className="text-sm font-semibold text-zinc-100">
              OSS Funding Matcher
            </span>
            <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
              Help open source maintainers find and apply for real funding.
              Free, open, and honest.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  How scoring works
                </Link>
              </li>
              <li>
                <Link href="/funders" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  Browse funders
                </Link>
              </li>
              <li>
                <Link href="/updates" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  Changelog
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="https://github.com/ossf/criticality-score" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  OpenSSF Methodology
                </a>
              </li>
              <li>
                <a href="https://oss.fund" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  oss.fund directory
                </a>
              </li>
              <li>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors">
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span>Built with Next.js, Supabase &amp; Auth.js</span>
          <span>Open source &middot; No tracking &middot; No ads</span>
        </div>
      </div>
    </footer>
  );
}
