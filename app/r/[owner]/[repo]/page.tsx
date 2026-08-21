import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/db";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

/**
 * Public, shareable page for a repo's criticality score and funding matches.
 * No login required — designed for sharing on social media / HN.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { owner, repo } = await params;
  const fullName = `${owner}/${repo}`;

  const { data: repoData } = await supabase
    .from("repos")
    .select("criticality_score, description, stars, primary_language")
    .eq("github_full_name", fullName)
    .single();

  const score = repoData
    ? `${Math.round((repoData.criticality_score ?? 0) * 100)}%`
    : null;

  return {
    title: score
      ? `${fullName} — ${score} Criticality Score | OSS Funding Matcher`
      : `${fullName} | OSS Funding Matcher`,
    description:
      repoData?.description ||
      `Check the criticality score and funding matches for ${fullName} on OSS Funding Matcher.`,
    openGraph: {
      title: score
        ? `${fullName}: ${score} criticality score`
        : `${fullName} — OSS Funding Matcher`,
      description:
        repoData?.description ||
        `Analyzed by OSS Funding Matcher — real funding for real open source projects.`,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: score
        ? `${fullName}: ${score} criticality`
        : `${fullName} — OSS Funding Matcher`,
      description:
        repoData?.description ||
        `Criticality score and funding matches for ${fullName}.`,
    },
  };
}

export default async function PublicRepoPage({ params }: Props) {
  const { owner, repo } = await params;
  const fullName = `${owner}/${repo}`;

  const { data: repoData } = await supabase
    .from("repos")
    .select(`
      *,
      matches (
        match_score,
        match_reasoning,
        funders (
          name,
          description,
          amount_range,
          application_type,
          focus_tags
        )
      )
    `)
    .eq("github_full_name", fullName)
    .single();

  if (!repoData) {
    notFound();
  }

  const score = repoData.criticality_score ?? 0;
  const scorePercent = Math.round(score * 100);
  const matches = (repoData.matches || [])
    .filter((m: any) => m.match_score >= 40)
    .sort((a: any, b: any) => b.match_score - a.match_score);

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      {/* Repo header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          {fullName}
        </h1>
        {repoData.description && (
          <p className="mt-2 text-sm text-zinc-400 leading-relaxed">
            {repoData.description}
          </p>
        )}
        <div className="mt-3 flex items-center gap-4 text-xs text-zinc-500">
          {repoData.primary_language && (
            <span>{repoData.primary_language}</span>
          )}
          <span>⭐ {repoData.stars ?? 0}</span>
        </div>
      </div>

      {/* Score card */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Criticality Score
            </h2>
            <p className="mt-1 text-xs text-zinc-600">
              Based on OpenSSF methodology
            </p>
          </div>
          <div className={`text-3xl font-bold tabular-nums ${getScoreColor(scorePercent)}`}>
            {scorePercent}%
          </div>
        </div>
        {/* Score bar */}
        <div className="mt-4 h-2 rounded-full bg-zinc-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${getBarColor(scorePercent)}`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {scorePercent >= 70
            ? "This project is critical infrastructure — widely used, actively maintained, and embedded in the ecosystem."
            : scorePercent >= 40
            ? "This project has meaningful usage and is worth funding."
            : "This project is still growing. It may qualify for smaller grants or early-stage funding."}
        </p>
      </div>

      {/* Matches */}
      {matches.length > 0 && (
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500 mb-4">
            Funding Matches ({matches.length})
          </h2>
          <div className="space-y-3">
            {matches.map((match: any) => (
              <div
                key={match.match_score + match.funders.name}
                className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-zinc-100">
                      {match.funders.name}
                    </h3>
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {match.funders.amount_range}
                    </p>
                    <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
                      {match.match_reasoning}
                    </p>
                  </div>
                  <div className={`text-lg font-bold tabular-nums shrink-0 ${getMatchScoreColor(match.match_score)}`}>
                    {match.match_score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 rounded-lg border border-zinc-800 bg-zinc-900/30 p-6 text-center">
        <p className="text-sm text-zinc-400">
          Want to find funding for your own projects?
        </p>
        <a
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-medium text-zinc-900 hover:bg-zinc-200 transition-colors"
        >
          Try OSS Funding Matcher
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function getScoreColor(percent: number): string {
  if (percent >= 70) return "text-red-400";
  if (percent >= 50) return "text-orange-400";
  if (percent >= 30) return "text-yellow-400";
  return "text-zinc-400";
}

function getBarColor(percent: number): string {
  if (percent >= 70) return "bg-red-500";
  if (percent >= 50) return "bg-orange-500";
  if (percent >= 30) return "bg-yellow-500";
  return "bg-zinc-500";
}

function getMatchScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-blue-400";
  if (score >= 40) return "text-yellow-400";
  return "text-zinc-500";
}
