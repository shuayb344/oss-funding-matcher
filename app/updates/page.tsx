import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Updates — OSS Funding Matcher",
  description: "What's new in OSS Funding Matcher.",
};

const updates = [
  {
    date: "August 2026",
    tag: "Launch",
    changes: [
      "Initial launch of OSS Funding Matcher",
      "GitHub OAuth login — sign in with one click, read-only access",
      "Criticality scoring based on OpenSSF methodology (reimplemented in JS)",
      "AI matching against 18 verified funding programs",
      "AI pitch generation with honest framing for nomination-based funders",
      "Pitch editing — save your edits before copying",
      "Shareable public repo pages at /r/[owner]/[repo]",
      "Scoring explainer page at /about",
      "Dark/light mode toggle with system preference detection",
      "Rate limiting on all API endpoints",
      "Supabase with row-level security",
    ],
  },
  {
    date: "Coming Soon",
    tag: "Roadmap",
    changes: [
      "In-app pitch editing with formatting options",
      "Export pitch as PDF or Markdown",
      "Funding program browser with filters",
      "Recurring score refresh via Vercel Cron",
      "Email notifications when new matching programs appear",
      "Integration with oss.fund's full directory (40+ programs)",
      "Public leaderboard of most critical unfunded projects",
    ],
  },
];

export default function UpdatesPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
        Updates
      </h1>
      <p className="mt-2 text-sm text-zinc-400">
        What&apos;s new and what&apos;s coming.
      </p>

      <div className="mt-10 space-y-10">
        {updates.map((section) => (
          <div key={section.date}>
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold text-zinc-200">
                {section.date}
              </h2>
              <span className="inline-flex items-center rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
                {section.tag}
              </span>
            </div>
            <ul className="space-y-2.5">
              {section.changes.map((change, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 text-sm text-zinc-400 leading-relaxed"
                >
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-zinc-700 shrink-0" />
                  {change}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
