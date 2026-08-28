import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/db";
import { Star, GitFork, Users, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ owner: string; repo: string }>;
}

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
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-12 min-h-[calc(100vh-3.5rem)]">
      {/* Repo header card */}
      <div className="mb-8 border-b border-slate-200 dark:border-white/10 pb-6">
        <div className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">
          // Public Project Report
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans sm:text-3xl">
            {fullName}
          </h1>
          {repoData.primary_language && (
            <span className="border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#111116] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400">
              {repoData.primary_language}
            </span>
          )}
        </div>
        {repoData.description && (
          <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
            {repoData.description}
          </p>
        )}
        <div className="mt-4 flex items-center gap-5 font-mono text-xs text-slate-500 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5 text-amber-400" /> {repoData.stars ?? 0}
          </span>
          <span className="flex items-center gap-1.5">
            <GitFork className="h-3.5 w-3.5 text-blue-400" /> {repoData.forks ?? 0}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-violet-400" /> {repoData.contributors_count ?? 0}
          </span>
        </div>
      </div>

      {/* Criticality Score card */}
      <div className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-6 mb-8 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-mono text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-zinc-400">
              Criticality Rating
            </h2>
            <p className="mt-0.5 font-mono text-[11px] text-zinc-500 uppercase">
              [ OpenSSF Algorithm ]
            </p>
          </div>
          <div className={`text-3xl sm:text-4xl font-bold font-mono tabular-nums ${getScoreTextColor(scorePercent)}`}>
            {scorePercent}%
          </div>
        </div>

        <div className="mt-4 h-2 rounded-none bg-slate-200 dark:bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-none transition-all ${getBarColor(scorePercent)}`}
            style={{ width: `${scorePercent}%` }}
          />
        </div>

        <p className="mt-4 text-xs text-slate-500 dark:text-zinc-400 font-sans leading-relaxed">
          {scorePercent >= 70
            ? "This project qualifies as critical infrastructure — high commit velocity, healthy maintainer distribution, and ecosystem dependency."
            : scorePercent >= 40
            ? "This project maintains solid active usage and qualifies for open source grant funds."
            : "This project is developing. Eligible for micro-grants and incubator funding programs."}
        </p>
      </div>

      {/* Matched grant list */}
      {matches.length > 0 && (
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-slate-500 dark:text-zinc-400 mb-4">
            // Matched Grants ({matches.length})
          </div>
          <div className="space-y-3">
            {matches.map((match: any) => (
              <div
                key={match.match_score + match.funders.name}
                className="rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-5 shadow-sm dark:shadow-none"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white font-sans">
                      {match.funders.name}
                    </h3>
                    <p className="mt-0.5 font-mono text-xs text-emerald-400 font-bold">
                      {match.funders.amount_range}
                    </p>
                    <p className="mt-2 text-xs text-slate-500 dark:text-zinc-400 leading-relaxed font-sans">
                      {match.match_reasoning}
                    </p>
                  </div>
                  <div className={`text-xl font-bold font-mono tabular-nums shrink-0 ${getMatchScoreColor(match.match_score)}`}>
                    {match.match_score}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA section */}
      <div className="mt-12 rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-8 text-center shadow-sm dark:shadow-none">
        <p className="text-xs text-slate-500 dark:text-zinc-400 font-sans">
          Want to analyze your open source repositories for real funding opportunities?
        </p>
        <a
          href="/"
          className="mt-4 inline-flex items-center gap-2 rounded-none bg-emerald-500 border border-emerald-400 px-6 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black hover:bg-emerald-400 hover:shadow-[0_0_15px_rgba(34,197,94,0.3)] transition-all"
        >
          TRY OSS FUNDING MATCHER
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

function getScoreTextColor(percent: number): string {
  if (percent >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (percent >= 50) return "text-amber-600 dark:text-amber-400";
  if (percent >= 30) return "text-yellow-600 dark:text-yellow-400";
  return "text-slate-500 dark:text-zinc-400";
}

function getBarColor(percent: number): string {
  if (percent >= 70) return "bg-emerald-500";
  if (percent >= 50) return "bg-amber-500";
  if (percent >= 30) return "bg-yellow-500";
  return "bg-zinc-600";
}

function getMatchScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 60) return "text-blue-600 dark:text-blue-400";
  if (score >= 40) return "text-amber-600 dark:text-amber-400";
  return "text-slate-500 dark:text-zinc-500";
}
