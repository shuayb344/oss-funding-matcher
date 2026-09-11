import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { computeCriticalityScore, RepoMetrics } from './scoring';

// Freeze time so age/recency calculations are deterministic
const FIXED_NOW = new Date('2026-01-01T00:00:00Z').getTime();

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(FIXED_NOW);
});

afterEach(() => {
  vi.useRealTimers();
});

function baseMetrics(overrides: Partial<RepoMetrics> = {}): RepoMetrics {
  const nowIso = new Date(FIXED_NOW).toISOString();
  return {
    stars: 10,
    forks: 2,
    contributors_count: 5,
    commit_frequency: 10, // commits in last 90 days
    open_issues: 3,
    created_at: nowIso,
    last_push: nowIso,
    ...overrides,
  };
}

describe('computeCriticalityScore edge cases', () => {
  it('zero contributors reduces score compared to many contributors', () => {
    const zero = computeCriticalityScore(baseMetrics({ contributors_count: 0 }));
    const many = computeCriticalityScore(baseMetrics({ contributors_count: 200 }));
    expect(zero).toBeGreaterThanOrEqual(0);
    expect(many).toBeGreaterThan(zero);
  });

  it('brand-new repo yields a low score', () => {
    const metrics = baseMetrics({
      contributors_count: 1,
      commit_frequency: 1,
      stars: 0,
      forks: 0,
      created_at: new Date(FIXED_NOW).toISOString(),
      last_push: new Date(FIXED_NOW).toISOString(),
    });
    const score = computeCriticalityScore(metrics);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThan(0.3);
  });

  it('ancient inactive repo gets some age credit but low recency', () => {
    const metrics = baseMetrics({
      contributors_count: 2,
      commit_frequency: 0,
      stars: 5,
      forks: 0,
      created_at: new Date('2000-01-01T00:00:00Z').toISOString(),
      last_push: new Date('2018-01-01T00:00:00Z').toISOString(),
    });
    const score = computeCriticalityScore(metrics);
    // Should be larger than a brand new repo above, but not critical
    expect(score).toBeGreaterThan(0.1);
    expect(score).toBeLessThan(0.7);
  });

  it('huge stars but no recent commits gives moderate score', () => {
    const metrics = baseMetrics({
      contributors_count: 1,
      commit_frequency: 0,
      stars: 150_000,
      forks: 10_000,
      created_at: new Date('2015-01-01T00:00:00Z').toISOString(),
      last_push: new Date('2020-01-01T00:00:00Z').toISOString(),
    });
    const score = computeCriticalityScore(metrics);
    expect(score).toBeGreaterThan(0.25);
    expect(score).toBeLessThan(0.8);
  });

  it('high-activity project scores as Critical (>= 0.7)', () => {
    const metrics = baseMetrics({
      contributors_count: 800,
      commit_frequency: 800,
      stars: 50000,
      forks: 5000,
      created_at: new Date('2010-01-01T00:00:00Z').toISOString(),
      last_push: new Date(FIXED_NOW).toISOString(),
    });
    const score = computeCriticalityScore(metrics);
    expect(score).toBeGreaterThanOrEqual(0.7);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('extreme inputs are clamped to <= 1 and >= 0', () => {
    const metrics = baseMetrics({
      contributors_count: 1_000_000,
      commit_frequency: 1_000_000,
      stars: 1_000_000_000,
      forks: 2_000_000_000,
      created_at: new Date('1990-01-01T00:00:00Z').toISOString(),
      last_push: new Date(FIXED_NOW).toISOString(),
    });
    const score = computeCriticalityScore(metrics);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(1);
  });

  it('score is rounded to 3 decimal places', () => {
    const metrics = baseMetrics({
      contributors_count: 37,
      commit_frequency: 12,
      stars: 1234,
      forks: 45,
      created_at: new Date('2012-07-01T00:00:00Z').toISOString(),
      last_push: new Date(FIXED_NOW).toISOString(),
    });
    const score = computeCriticalityScore(metrics);
    expect(score).toBe(Math.round(score * 1000) / 1000);
  });

  it('recency increases score compared to old last_push', () => {
    const recent = computeCriticalityScore(
      baseMetrics({ last_push: new Date(FIXED_NOW).toISOString() })
    );
    const old = computeCriticalityScore(
      baseMetrics({ last_push: new Date('2019-01-01T00:00:00Z').toISOString() })
    );
    expect(recent).toBeGreaterThan(old);
  });

  it('commit frequency increases score compared to zero commits', () => {
    const withCommits = computeCriticalityScore(baseMetrics({ commit_frequency: 50 }));
    const without = computeCriticalityScore(baseMetrics({ commit_frequency: 0 }));
    expect(withCommits).toBeGreaterThan(without);
  });
});
