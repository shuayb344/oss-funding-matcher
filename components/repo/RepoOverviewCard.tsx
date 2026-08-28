import { ExternalLink, Star, GitFork, Users, Calendar } from "lucide-react";
import { getScoreTextColor, getMatchScoreBarBg } from "@/lib/repoUtils";

export interface Repo {
  id: string;
  github_full_name: string;
  description: string | null;
  primary_language: string | null;
  stars: number | null;
  forks: number | null;
  contributors_count: number | null;
  criticality_score: number | null;
  last_analyzed_at: string | null;
}

export function RepoOverviewCard({ repo }: { repo: Repo }) {
  const score = repo.criticality_score ?? 0;
  const scorePercent = Math.round(score * 100);

  return (
    <div className="mb-10 rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-6 sm:p-8 shadow-sm dark:shadow-none transition-all">
      {/* Header Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
            // Repository Metadata &amp; Criticality Profile
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">
              {repo.github_full_name}
            </h1>
            {repo.primary_language && (
              <span className="inline-flex items-center rounded-none border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-semibold">
                {repo.primary_language}
              </span>
            )}
          </div>
          {repo.description && (
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-zinc-400 font-sans leading-relaxed">
              {repo.description}
            </p>
          )}
        </div>

        <a
          href={`https://github.com/${repo.github_full_name}`}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center justify-center gap-1.5 rounded-none border border-slate-300 dark:border-white/10 bg-slate-100 dark:bg-white/[0.03] sm:px-4 py-2 font-mono sm:text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-slate-400 dark:hover:border-white/30 hover:text-slate-900 dark:hover:text-white transition-all uppercase"
        >
          VIEW ON GITHUB
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      {/* OpenSSF Score Progress Bar */}
      <div className="mt-6 border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
                OpenSSF Criticality Rating
              </span>
              <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-none border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 uppercase">
                {scorePercent >= 70
                  ? "[ CRITICAL INFRASTRUCTURE ]"
                  : scorePercent >= 40
                  ? "[ MODERATE CRITICALITY ]"
                  : "[ DEVELOPING TIER ]"}
              </span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono mt-1 leading-relaxed">
              Calculated based on commit velocity, contributor volume, issue activity, and project age.
            </div>
          </div>

          <div className="flex items-baseline gap-0.5 shrink-0 font-mono self-start sm:self-auto">
            <span className={`text-2xl sm:text-3xl font-bold tabular-nums ${getScoreTextColor(scorePercent)}`}>
              {scorePercent}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-500 font-semibold">%</span>
          </div>
        </div>

        <div className="h-2.5 w-full rounded-none bg-slate-200 dark:bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-none transition-all duration-500 ${getMatchScoreBarBg(scorePercent)}`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
      </div>

      {/* Detailed Metric Stat Cards */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111116] p-4 font-mono">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 text-xs mb-1">
            <Star className="h-4 w-4 text-amber-500" />
            <span>STARS</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {repo.stars?.toLocaleString() ?? 0}
          </div>
        </div>

        <div className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111116] p-4 font-mono">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 text-xs mb-1">
            <GitFork className="h-4 w-4 text-blue-500" />
            <span>FORKS</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {repo.forks?.toLocaleString() ?? 0}
          </div>
        </div>

        <div className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111116] p-4 font-mono">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 text-xs mb-1">
            <Users className="h-4 w-4 text-violet-500" />
            <span>CONTRIBUTORS</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums">
            {repo.contributors_count?.toLocaleString() ?? 0}
          </div>
        </div>

        <div className="rounded-none border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111116] p-4 font-mono">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-500 text-xs mb-1">
            <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            <span>LAST SYNCED</span>
          </div>
          <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300 truncate">
            {repo.last_analyzed_at ? new Date(repo.last_analyzed_at).toLocaleDateString() : "Recently"}
          </div>
        </div>
      </div>
    </div>
  );
}
