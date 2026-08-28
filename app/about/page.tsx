import type { Metadata } from "next";
import { Terminal, ShieldAlert } from "lucide-react";

export const metadata: Metadata = {
  title: "How Criticality Scoring Works — OSS Funding Matcher",
  description:
    "Learn how we compute open source criticality scores using OpenSSF's published methodology, reimplemented in JavaScript.",
};

const factors = [
  {
    name: "Commit Frequency",
    weight: "25%",
    variable: "commits",
    description:
      "Commits in the last 90 days. Active maintenance is the strongest signal that a project is alive and being improved.",
    why:
      "Projects with regular commits are actively maintained, meaning funding has immediate impact.",
    example: "linux kernel: ~3000 commits/90d → high score",
    colorBg: "bg-emerald-500",
    colorText: "text-emerald-400",
  },
  {
    name: "Contributor Count",
    weight: "20%",
    variable: "contributors",
    description:
      "Number of distinct contributors. More contributors = healthier project with shared ownership.",
    why:
      "A project with 100+ contributors is embedded in many workflows, making it critical infrastructure.",
    example: "1 contributor = fragile, 50+ = resilient",
    colorBg: "bg-blue-500",
    colorText: "text-blue-400",
  },
  {
    name: "Recent Activity",
    weight: "20%",
    variable: "recency",
    description:
      "Time since the last push. Recent activity indicates the project is actively maintained.",
    why:
      "A project last updated 2 years ago might be abandoned, even if it has high lifetime stars.",
    example: "Updated yesterday → 1.0, 6 months ago → ~0.5",
    colorBg: "bg-violet-500",
    colorText: "text-violet-400",
  },
  {
    name: "Project Age",
    weight: "15%",
    variable: "age",
    description:
      "Time since project creation. Older, still-active projects are deeply embedded in the ecosystem.",
    why:
      "A 10-year-old project that's still actively maintained is depended on by thousands of projects.",
    example: "10+ years old + active = high stability",
    colorBg: "bg-amber-500",
    colorText: "text-amber-400",
  },
  {
    name: "Issue Activity",
    weight: "10%",
    variable: "issues",
    description:
      "Open issues as a proxy for community engagement and active user feedback.",
    why:
      "Issues indicate active users finding edge cases and engaging with maintainers.",
    example: "0 issues = unused, 500+ = widely used",
    colorBg: "bg-orange-500",
    colorText: "text-orange-400",
  },
  {
    name: "Stars + Forks",
    weight: "10%",
    variable: "usage",
    description:
      "Usage signal and visibility proxy. Stars indicate awareness; forks indicate active use.",
    why:
      "Combined with activity signals, stars & forks confirm ecosystem adoption.",
    example: "10k stars + 2k forks = high adoption",
    colorBg: "bg-rose-500",
    colorText: "text-rose-400",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 bg-transparent min-h-[calc(100vh-3.5rem)]">
      {/* Header */}
      <div className="mb-12 border-b border-slate-200 dark:border-white/10 pb-8">
        <div className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-2">
          // OpenSSF Scoring Algorithm
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white font-sans sm:text-4xl">
          Methodology &amp; Criticality Scoring
        </h1>
        <p className="mt-3 text-sm text-slate-500 dark:text-zinc-400 leading-relaxed max-w-2xl font-sans">
          We reimplement OpenSSF&apos;s published criticality scoring algorithm in high-performance JavaScript for serverless execution using standard GitHub API endpoints.
        </p>
      </div>

      {/* Formula block: Square-cornered IDE Code Editor Block */}
      <div className="mb-12 rounded-none border border-slate-200 dark:border-white/10 bg-slate-900 dark:bg-[#060608] p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-center gap-2 justify-between border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span className="font-mono text-xs font-semibold uppercase tracking-widest text-zinc-400">
              criticality_score.ts
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase text-zinc-600">
            [ LOG-NORMALIZED WEIGHTED SUM ]
          </span>
        </div>

        <pre className="font-mono text-xs sm:text-sm text-zinc-300 overflow-x-auto leading-relaxed p-2">
          <code>
            <span className="text-zinc-500">// Formula definition</span>
            {"\n"}
            <span className="text-purple-400">const</span> <span className="text-emerald-400">criticalityScore</span> = (
            {"\n"}  <span className="text-emerald-400">commits</span> * <span className="text-emerald-300">0.25</span> +{" "}
            <span className="text-blue-400">contributors</span> * <span className="text-blue-300">0.20</span> +{" "}
            <span className="text-violet-400">recency</span> * <span className="text-violet-300">0.20</span> +
            {"\n"}  <span className="text-amber-400">age</span> * <span className="text-amber-300">0.15</span> +{" "}
            <span className="text-orange-400">issues</span> * <span className="text-orange-300">0.10</span> +{" "}
            <span className="text-rose-400">usage</span> * <span className="text-rose-300">0.10</span>
            {"\n"});
          </code>
        </pre>

        <p className="mt-4 text-xs text-zinc-500 font-sans border-t border-white/10 pt-4 leading-relaxed">
          Each raw metric is log-scaled prior to weighting to prevent extreme outliers (e.g. mega-repos) from skewing normalized distributions. Output score ranges strictly from 0.00 to 1.00.
        </p>
      </div>

      {/* Factor breakdown: 2-Column Square Card Grid */}
      <div className="mb-12">
        <div className="font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-6">
          // Parameter Breakdown Matrix
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {factors.map((factor) => (
            <div
              key={factor.name}
              className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-5 hover:border-slate-300 dark:hover:border-white/20 transition-all flex flex-col justify-between shadow-sm dark:shadow-none"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {/* Square indicator dot */}
                    <div className={`h-2.5 w-2.5 rounded-none ${factor.colorBg}`} />
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
                      {factor.name}
                    </h3>
                  </div>
                  <span className="font-mono text-xs font-bold text-slate-500 dark:text-zinc-400 border border-slate-200 dark:border-white/10 px-2 py-0.5 rounded-none bg-slate-50 dark:bg-white/[0.03]">
                    {factor.weight}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
                  {factor.description}
                </p>
                <p className="mt-2 text-xs text-slate-400 dark:text-zinc-500 leading-relaxed font-sans">
                  {factor.why}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/10">
                <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500 block">
                  EXAMPLE: <span className="text-slate-600 dark:text-zinc-400">{factor.example}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Limitations Block */}
      <div className="rounded-none border border-amber-500/30 bg-amber-50 dark:bg-amber-500/[0.03] p-6">
        <div className="flex items-center gap-2 mb-3">
          <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-amber-700 dark:text-amber-400">
            Methodology Boundaries &amp; Constraints
          </h2>
        </div>
        <ul className="space-y-3 font-sans text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="font-mono text-amber-600 dark:text-amber-400 select-none">[!]</span>
            <span>
              <strong className="text-slate-800 dark:text-zinc-200">Stars are down-weighted (10%):</strong> Stars alone can be inflated by social trends. We require active commit cadence and contributor volume for high scores.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="font-mono text-amber-600 dark:text-amber-400 select-none">[!]</span>
            <span>
              <strong className="text-slate-800 dark:text-zinc-200">Public metadata only:</strong> Scoring relies strictly on public GitHub API endpoints — private downstream dependencies are approximated via stars and forks.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
