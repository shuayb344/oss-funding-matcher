import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How Criticality Scoring Works — OSS Funding Matcher",
  description:
    "Learn how we compute open source criticality scores using OpenSSF's published methodology, reimplemented in JavaScript.",
};

const factors = [
  {
    name: "Commit Frequency",
    weight: "25%",
    weightValue: 0.25,
    description:
      "Commits in the last 90 days. Active maintenance is the strongest signal that a project is alive and being improved.",
    why:
      "Projects with regular commits are actively maintained, meaning funding has immediate impact. A project with 500+ commits in 90 days is likely critical infrastructure.",
    example: "linux kernel: ~3000 commits/90d → high score",
    color: "bg-emerald-500",
  },
  {
    name: "Contributor Count",
    weight: "20%",
    weightValue: 0.20,
    description:
      "Number of distinct contributors. More contributors = healthier project with shared ownership.",
    why:
      "A project with 100+ contributors can't be easily abandoned. It's embedded in many people's workflows, making it critical infrastructure.",
    example: "1 contributor = fragile, 50+ = resilient",
    color: "bg-blue-500",
  },
  {
    name: "Recent Activity",
    weight: "20%",
    weightValue: 0.20,
    description:
      "Time since the last push. Recent activity indicates the project is actively maintained.",
    why:
      "A project last updated 2 years ago might be abandoned, even if it has many stars. Recency matters more than total volume.",
    example: "Updated yesterday → 1.0, Updated 6 months ago → ~0.5",
    color: "bg-violet-500",
  },
  {
    name: "Project Age",
    weight: "15%",
    weightValue: 0.15,
    description:
      "Time since project creation. Older, still-active projects are more embedded in the ecosystem.",
    why:
      "A 10-year-old project that's still actively maintained is deeply embedded. It's likely depended on by thousands of other projects.",
    example: "10+ years old + still active = highly embedded",
    color: "bg-amber-500",
  },
  {
    name: "Issue Activity",
    weight: "10%",
    weightValue: 0.10,
    description:
      "Open issues as a proxy for community engagement. More issues = more people using and reporting on the project.",
    why:
      "Issues indicate people are actively using the project, finding edge cases, and engaging with maintainers.",
    example: "0 issues =无人问津, 500+ = widely used",
    color: "bg-orange-500",
  },
  {
    name: "Stars + Forks",
    weight: "10%",
    weightValue: 0.10,
    description:
      "Usage signal and visibility proxy. Stars indicate awareness; forks indicate active use or modification.",
    why:
      "While stars can be gamed, combined with other signals they indicate the project is known and used. Forks are a stronger signal of actual usage.",
    example: "10k stars + 2k forks = significant usage",
    color: "bg-rose-500",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          How Criticality Scoring Works
        </h1>
        <p className="mt-3 text-sm text-zinc-400 leading-relaxed max-w-xl">
          We reimplement OpenSSF&apos;s published criticality scoring
          methodology in JavaScript, using GitHub API data you already have.
          This avoids running their Go CLI inside serverless functions.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-xs text-zinc-500">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
          </svg>
          Based on{" "}
          <a
            href="https://github.com/ossf/criticality-score"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-zinc-300 transition-colors"
          >
            OpenSSF&apos;s open methodology
          </a>
          , reimplemented in JS
        </div>
      </div>

      {/* Score formula */}
      <div className="mb-12 rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
          Formula
        </h2>
        <div className="font-mono text-sm text-zinc-300 leading-relaxed">
          <span className="text-zinc-500">score</span> ={" "}
          <span className="text-emerald-400">commits</span> × 0.25 +{" "}
          <span className="text-blue-400">contributors</span> × 0.20 +{" "}
          <span className="text-violet-400">recency</span> × 0.20 +{" "}
          <span className="text-amber-400">age</span> × 0.15 +{" "}
          <span className="text-orange-400">issues</span> × 0.10 +{" "}
          <span className="text-rose-400">usage</span> × 0.10
        </div>
        <p className="mt-4 text-xs text-zinc-500 leading-relaxed">
          Each factor is normalized to 0–1 using a log scale to prevent extreme
          outliers from dominating. The weighted sum produces a final score
          between 0.0 and 1.0.
        </p>
      </div>

      {/* Factor breakdown */}
      <div className="space-y-6">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Factor Breakdown
        </h2>
        {factors.map((factor, i) => (
          <div
            key={factor.name}
            className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5"
          >
            <div className="flex items-start gap-4">
              <div className="flex flex-col items-center gap-1 shrink-0">
                <div className={`h-2 w-2 rounded-full ${factor.color}`} />
                {i < factors.length - 1 && (
                  <div className="w-px h-full min-h-[40px] bg-zinc-800" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-zinc-100">
                    {factor.name}
                  </h3>
                  <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
                    {factor.weight}
                  </span>
                </div>
                <p className="mt-1.5 text-sm text-zinc-400 leading-relaxed">
                  {factor.description}
                </p>
                <p className="mt-2 text-xs text-zinc-500 leading-relaxed">
                  {factor.why}
                </p>
                <div className="mt-2 inline-flex items-center gap-1.5 rounded bg-zinc-800/50 px-2 py-1 text-[10px] text-zinc-500 font-mono">
                  {factor.example}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Limitations */}
      <div className="mt-12 rounded-lg border border-yellow-900/30 bg-yellow-950/10 p-6">
        <h2 className="text-sm font-semibold text-yellow-400 mb-3">
          Known Limitations
        </h2>
        <ul className="space-y-2 text-sm text-zinc-400 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5">•</span>
            <span>
              <strong className="text-zinc-300">Stars can be gamed.</strong>{" "}
              We use them as one factor among six, weighted at only 10%. A repo
              with 10k stars but 0 commits in 90 days will still score low.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5">•</span>
            <span>
              <strong className="text-zinc-300">Dependents are hard to measure for free.</strong>{" "}
              GitHub&apos;s dependency graph API has limitations. We approximate
              with stars/forks as a usage proxy. This is documented openly.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500 mt-0.5">•</span>
            <span>
              <strong className="text-zinc-300">Not a perfect measure of &ldquo;criticality.&rdquo;</strong>{" "}
              This is a heuristic. Real criticality involves factors we can&apos;t
              measure from the GitHub API alone (e.g., supply chain position).
            </span>
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center">
        <a
          href="https://github.com/ossf/criticality-score"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors underline underline-offset-2"
        >
          View the original OpenSSF methodology →
        </a>
      </div>
    </div>
  );
}
