
export interface RepoMetrics {
  stars: number;
  forks: number;
  contributors_count: number;
  commit_frequency: number; // commits in last 90 days
  open_issues: number;
  created_at: string; // ISO date
  last_push: string; // ISO date
}

/**
 * Normalize a value to 0–1 using a log scale.
 * This prevents extreme outliers (e.g., repos with 100k stars)
 * from dominating the score.
 */
function normalizeLog(value: number, maxExpected: number): number {
  if (value <= 0) return 0;
  const logValue = Math.log10(value + 1);
  const logMax = Math.log10(maxExpected + 1);
  return Math.min(1, logValue / logMax);
}

/**
 * Compute the criticality score for a repository.
 *
 * Weights are based on OpenSSF's published methodology:
 * - Contributor count:  0.20 (healthy project = many contributors)
 * - Commit frequency:   0.25 (active maintenance)
 * - Project age:        0.15 (embedded in ecosystem = hard to replace)
 * - Recent activity:    0.20 (still maintained)
 * - Issue activity:     0.10 (community engagement)
 * - Stars + forks:      0.10 (usage signal / visibility)
 */
export function computeCriticalityScore(metrics: RepoMetrics): number {
  // --- Factor 1: Contributor count (weight: 0.20) ---
  // More distinct contributors = healthier, more critical
  const contributorScore = normalizeLog(metrics.contributors_count, 500);

  // --- Factor 2: Commit frequency (weight: 0.25) ---
  // Commits per 90 days — active maintenance signal
  const commitScore = normalizeLog(metrics.commit_frequency, 1000);

  // --- Factor 3: Project age (weight: 0.15) ---
  // Older, still-active projects are more embedded and harder to replace
  const ageMs = Date.now() - new Date(metrics.created_at).getTime();
  const ageYears = ageMs / (365.25 * 24 * 60 * 60 * 1000);
  const ageScore = normalizeLog(ageYears, 15); // 15 years ≈ max expected

  // --- Factor 4: Recent activity (weight: 0.20) ---
  // Time since last push — newer = more active
  const lastPushMs = Date.now() - new Date(metrics.last_push).getTime();
  const lastPushDays = lastPushMs / (24 * 60 * 60 * 1000);
  // Invert: recent push = high score. 0 days = 1.0, 365 days = ~0.3
  const recencyScore = Math.max(0, 1 - (lastPushDays / 365));

  // --- Factor 5: Issue activity (weight: 0.10) ---
  // Closed issues indicate community engagement
  const issueScore = normalizeLog(metrics.open_issues, 2000);

  // --- Factor 6: Stars + forks (weight: 0.10) ---
  // Usage signal / visibility proxy
  const usageMetric = metrics.stars + metrics.forks * 2; // forks weighted slightly less
  const usageScore = normalizeLog(usageMetric, 50000);

  // --- Weighted sum ---
  const score =
    contributorScore * 0.20 +
    commitScore * 0.25 +
    ageScore * 0.15 +
    recencyScore * 0.20 +
    issueScore * 0.10 +
    usageScore * 0.10;

  // Clamp to [0, 1] and round to 3 decimal places
  return Math.round(Math.max(0, Math.min(1, score)) * 1000) / 1000;
}

/**
 * Human-readable summary of a criticality score.
 */
export function scoreLabel(score: number): {
  label: string;
  color: string;
} {
  if (score >= 0.7) return { label: "Critical", color: "text-red-400" };
  if (score >= 0.5) return { label: "High", color: "text-orange-400" };
  if (score >= 0.3) return { label: "Moderate", color: "text-yellow-400" };
  if (score >= 0.1) return { label: "Low", color: "text-zinc-400" };
  return { label: "Minimal", color: "text-zinc-600" };
}
