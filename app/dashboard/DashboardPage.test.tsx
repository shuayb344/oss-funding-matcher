import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";

const mockUseSession = vi.fn();
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();

vi.mock("next-auth/react", () => ({
  useSession: (...args: unknown[]) => mockUseSession(...args),
}));

vi.mock("@tanstack/react-query", () => ({
  useQuery: (...args: unknown[]) => mockUseQuery(...args),
  useMutation: (...args: unknown[]) => mockUseMutation(...args),
}));

vi.mock("@/lib/repoUtils", () => ({
  getScoreTierInfo: () => ({ label: "Strong", accentBg: "bg-emerald-500", textColor: "text-emerald-600" }),
  getScoreTextColor: () => "text-emerald-600",
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    mockUseSession.mockReturnValue({
      data: { user: { name: "Ada" } },
      status: "authenticated",
    });

    mockUseQuery.mockReturnValue({
      data: [
        {
          id: "repo-1",
          github_full_name: "acme/secure-lib",
          description: "Security tooling library",
          primary_language: "TypeScript",
          stars: 120,
          forks: 23,
          contributors_count: 7,
          criticality_score: 0.87,
          last_analyzed_at: "2026-09-01T00:00:00Z",
        },
      ],
      isLoading: false,
      refetch: vi.fn(),
    });

    mockUseMutation.mockReturnValue({
      isPending: false,
      mutate: vi.fn(),
    });
  });

  it("renders repo cards and dashboard header from fetched data", async () => {
    render(<DashboardPage />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText(/Connected as/i)).toBeInTheDocument();
    expect(screen.getByText("acme/secure-lib")).toBeInTheDocument();
    expect(screen.getByText("Security tooling library")).toBeInTheDocument();
    expect(screen.getAllByText("87%")).toHaveLength(2);
  });

  it("allows the sync action to be triggered", async () => {
    const mutate = vi.fn();
    mockUseMutation.mockReturnValue({
      isPending: false,
      mutate,
    });

    render(<DashboardPage />);

    fireEvent.click(screen.getByRole("button", { name: /re-sync repos/i }));

    await waitFor(() => {
      expect(mutate).toHaveBeenCalledTimes(1);
    });
  });
});
