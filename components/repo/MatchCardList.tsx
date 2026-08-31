import { Loader2, Sparkles, ExternalLink } from "lucide-react";
import { getScoreTextColor, getMatchScoreBarBg } from "@/lib/repoUtils";

export interface Match {
  id: string;
  match_score: number;
  match_reasoning: string;
  funders: {
    name: string;
    description: string;
    amount_range: string;
    application_type: string;
    application_url: string | null;
    focus_tags: string[];
  };
}

export function MatchCardList({
  matches,
  selectedMatch,
  generatingPitch,
  onGeneratePitch,
}: {
  matches: Match[];
  selectedMatch: Match | null;
  generatingPitch: boolean;
  onGeneratePitch: (match: Match) => void;
}) {
  return (
    <div className="space-y-4">
      {matches.map((match) => (
        <div
          key={match.id}
          className="group relative rounded-none border border-slate-200 dark:border-white/10 bg-white dark:bg-[#0e0e12] backdrop-blur-xl p-6 hover:border-slate-300 dark:hover:border-white/20 transition-all overflow-hidden shadow-sm dark:shadow-none"
        >
          <div className={`absolute left-0 top-0 bottom-0 w-1 ${getMatchScoreBarBg(match.match_score)}`} />

          <div className="flex flex-col sm:flex-row items-start justify-between gap-4 pl-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white font-sans">
                  {match.funders.name}
                </h3>
                <span className="inline-flex items-center rounded-none border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#111116] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-slate-600 dark:text-zinc-400">
                  {match.funders.application_type.replace(/_/g, " ")}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                {match.funders.amount_range}
              </p>
              <p className="mt-3 text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                {match.match_reasoning}
              </p>
              {match.funders.focus_tags?.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 font-mono text-[10px]">
                  {match.funders.focus_tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-none border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-[#111116] px-2 py-0.5 text-slate-600 dark:text-zinc-400 uppercase"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex sm:flex-col items-end justify-between sm:justify-start gap-1 w-full sm:w-auto shrink-0 font-mono border-t sm:border-t-0 border-slate-200 dark:border-white/10 pt-3 sm:pt-0">
              <div className={`text-2xl font-bold tabular-nums ${getScoreTextColor(match.match_score)}`}>
                {match.match_score}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-zinc-500 uppercase tracking-widest">
                / 100 MATCH
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-slate-200 dark:border-white/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <button
              onClick={() => onGeneratePitch(match)}
              disabled={generatingPitch && selectedMatch?.id === match.id}
              className="inline-flex items-center justify-center gap-2 rounded-none bg-emerald-500/10 border border-emerald-500/40 px-4 py-2 font-mono text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20 hover:border-emerald-400 transition-all disabled:opacity-50"
            >
              {generatingPitch && selectedMatch?.id === match.id ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  GENERATING PITCH…
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  GENERATE PITCH
                </>
              )}
            </button>

            {match.funders.application_url && (
              <a
                href={match.funders.application_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 font-mono text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                FUNDER WEBSITE
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
