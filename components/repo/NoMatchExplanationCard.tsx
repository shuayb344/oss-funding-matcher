import Link from "next/link";
import { Info } from "lucide-react";

export function NoMatchExplanationCard({
  repoFullName,
  noMatchExplanation,
}: {
  repoFullName?: string;
  noMatchExplanation: string | null;
}) {
  return (
    <div className="rounded-none border border-amber-500/40 bg-amber-500/10 dark:bg-amber-500/10 p-6 font-mono shadow-sm">
      <div className="flex items-start gap-3">
        <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            // NO HIGH-CONFIDENCE MATCHES FOUND (&lt; 40% THRESHOLD)
          </h3>
          <p className="mt-2 text-xs text-slate-700 dark:text-zinc-300 leading-relaxed font-sans">
            {noMatchExplanation ||
              `Evaluated ${repoFullName || "repository"} against active grant programs. No funder reached the 40% compatibility score required to generate a high-confidence match.`}
          </p>

          <div className="mt-4 pt-4 border-t border-amber-500/20 text-xs space-y-2 font-mono">
            <div className="font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
              WHY THIS HAPPENS &amp; RECOMMENDED NEXT STEPS:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-zinc-400 text-[11px] font-sans">
              <li>
                <strong className="font-mono">Criticality Threshold:</strong> Programs like the Sovereign Tech Fund or Linux Foundation prioritize core infrastructure projects with score &gt;50%.
              </li>
              <li>
                <strong className="font-mono">Funder Alignment:</strong> Active grant directories may currently target specific niches (e.g. cryptography, Rust tooling, or security audits).
              </li>
              <li>
                <strong className="font-mono">Action Item:</strong> Explore open calls directly in our{" "}
                <Link href="/funders" className="text-emerald-600 dark:text-emerald-400 font-bold underline font-mono">
                  FUNDER REGISTRY
                </Link>{" "}
                or re-sync your repo after increasing commit volume.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
