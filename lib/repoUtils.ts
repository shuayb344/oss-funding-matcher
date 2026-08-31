export interface ScoreTierInfo {
  tier: "critical" | "moderate" | "developing";
  label: string;
  fullLabel: string;
  accentBg: string;
  textColor: string;
  badgeBg: string;
}

export function getScoreTierInfo(score: number): ScoreTierInfo {
  // Normalize: if score is decimal 0..1 (and > 0), convert to percentage 0..100
  const pct = score <= 1 && score > 0 ? score * 100 : score;

  if (pct >= 50) {
    return {
      tier: "critical",
      label: "Critical",
      fullLabel: "[ CRITICAL INFRASTRUCTURE ]",
      accentBg: "bg-emerald-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      badgeBg: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    };
  }
  if (pct >= 30) {
    return {
      tier: "moderate",
      label: "Moderate",
      fullLabel: "[ MODERATE CRITICALITY ]",
      accentBg: "bg-amber-500",
      textColor: "text-amber-600 dark:text-amber-400",
      badgeBg: "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    };
  }
  return {
    tier: "developing",
    label: "Developing",
    fullLabel: "[ DEVELOPING TIER ]",
    accentBg: "bg-slate-400 dark:bg-zinc-600",
    textColor: "text-slate-500 dark:text-zinc-500",
    badgeBg: "border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.04] text-slate-500 dark:text-zinc-400",
  };
}

export function getScoreTextColor(score: number): string {
  const pct = score <= 1 && score > 0 ? score * 100 : score;
  if (pct >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 50) return "text-emerald-600 dark:text-emerald-400";
  if (pct >= 30) return "text-amber-600 dark:text-amber-400";
  return "text-slate-500 dark:text-zinc-500";
}

export function getMatchScoreBarBg(score: number): string {
  const pct = score <= 1 && score > 0 ? score * 100 : score;
  if (pct >= 80) return "bg-emerald-500";
  if (pct >= 50) return "bg-emerald-500";
  if (pct >= 30) return "bg-amber-500";
  return "bg-zinc-500";
}

