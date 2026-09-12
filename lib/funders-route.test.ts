import { beforeEach, describe, expect, it, vi } from "vitest";

interface Suggestion {
  id: string;
  name: string;
  application_url: string;
  description: string;
  focus_tags: string[];
  notes: string;
  status: string;
  created_at: string;
}

interface MockResponse<T = unknown> {
  payload: T;
  status: number;
}

function makeResponse<T>(payload: T, init?: { status?: number }): MockResponse<T> {
  return {
    payload,
    status: init?.status ?? 200,
  };
}

const submittedSuggestions: Suggestion[] = [];

describe("funder suggestion flow", () => {
  beforeEach(() => {
    vi.resetModules();
    submittedSuggestions.length = 0;
  });

  it("submits a funder suggestion and makes it visible in the admin queue", async () => {
    const mockUser = { id: "user-123", github_id: "gh-42", username: "octocat" };

    vi.doMock("@/lib/auth", () => ({
      auth: async () => ({
        user: { id: "gh-42", username: "octocat", name: "octocat" },
      }),
    }));

    vi.doMock("@/lib/admin", () => ({
      isUserAdmin: () => true,
    }));

    vi.doMock("@/lib/db", () => ({
      supabase: {
        from: (table: string) => {
          if (table === "users") {
            return {
              select: () => ({
                eq: () => ({
                  maybeSingle: async () => ({ data: mockUser, error: null }),
                }),
              }),
            };
          }

          if (table === "funder_suggestions") {
            return {
              insert: (payload: Omit<Suggestion, "id" | "created_at">) => ({
                select: () => ({
                  single: async () => {
                    const suggestion: Suggestion = {
                      id: "suggestion-123",
                      ...payload,
                      created_at: "2026-09-12T00:00:00Z",
                    };
                    submittedSuggestions.push(suggestion);
                    return { data: suggestion, error: null };
                  },
                }),
              }),
              select: () => ({
                order: async () => ({ data: submittedSuggestions, error: null }),
              }),
            };
          }

          return {
            select: () => ({}),
            insert: () => ({}),
          };
        },
      },
    }));

    vi.doMock("next/server", () => ({
      NextResponse: {
        json: <T,>(payload: T, init?: { status?: number }) => makeResponse(payload, init),
      },
    }));

    type SuggestRoute = { POST: (req: Request) => Promise<MockResponse<{ success: boolean; suggestion: Suggestion }>> };
    type AdminRoute = { GET: (req: Request) => Promise<MockResponse<{ suggestions: Suggestion[] }>> };

    const { POST } = (await import("../app/api/funders/suggest/route")) as unknown as SuggestRoute;
    const { GET } = (await import("../app/api/admin/suggestions/route")) as unknown as AdminRoute;

    const payload = {
      name: "Open Source Seed Fund",
      application_url: "example.com/apply",
      description: "Supports open source infrastructure teams.",
      focus_tags: ["infrastructure", "security"],
      notes: "Community submission",
    };

    const submitRes = await POST(
      new Request("http://localhost/api/funders/suggest", {
        method: "POST",
        body: JSON.stringify(payload),
      })
    );

    expect(submitRes.status).toBe(200);
    expect(submitRes.payload.success).toBe(true);
    expect(submitRes.payload.suggestion).toMatchObject({
      name: payload.name,
      application_url: "https://example.com/apply",
      status: "pending",
    });

    const queueRes = await GET(
      new Request("http://localhost/api/admin/suggestions", {
        method: "GET",
      })
    );

    expect(queueRes.status).toBe(200);
    expect(queueRes.payload.suggestions).toHaveLength(1);
    expect(queueRes.payload.suggestions[0]).toMatchObject({
      name: payload.name,
      application_url: "https://example.com/apply",
      status: "pending",
    });
  });
});