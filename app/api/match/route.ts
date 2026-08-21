import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { callAI } from "@/lib/ai";
import { rateLimitOrContinue } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface MatchInput {
  repo_id: string;
}

interface FunderRecord {
  id: string;
  name: string;
  description: string;
  amount_range: string;
  focus_tags: string[];
  application_type: string;
  eligibility_notes: string;
}

interface MatchResult {
  funder_id: string;
  match_score: number;
  reasoning: string;
}

/**
 * POST /api/match
 * Body: { repo_id: string }
 *
 * Fetches the repo from Supabase, loads all funders, sends them
 * to the AI for matching, and stores the results.
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 10 matching requests per minute per user
  const { response } = rateLimitOrContinue(`match:${session.user.id}`, 10, 60_000);
  if (response) return response;

  const body: MatchInput = await request.json();
  const { repo_id } = body;

  if (!repo_id) {
    return NextResponse.json({ error: "repo_id is required" }, { status: 400 });
  }

  // Fetch the repo and verify ownership
  const { data: repo } = await supabase
    .from("repos")
    .select("*, users!inner(github_id)")
    .eq("id", repo_id)
    .single();

  if (!repo || (repo.users as any).github_id !== session.user.id) {
    return NextResponse.json({ error: "Repo not found" }, { status: 404 });
  }

  // Fetch all funders
  const { data: funders } = await supabase
    .from("funders")
    .select("*")
    .order("name");

  if (!funders || funders.length === 0) {
    return NextResponse.json({ error: "No funders found" }, { status: 404 });
  }

  // Build the AI prompt
  const prompt = buildMatchingPrompt(repo, funders as FunderRecord[]);

  try {
    const { content, provider } = await callAI(prompt);

    // Parse the AI response
    const matches = parseMatchResponse(content);

    // Store matches in the database
    const storedMatches = [];

    for (const match of matches) {
      if (match.match_score < 40) continue; // Only store meaningful matches

      const { data: stored } = await supabase
        .from("matches")
        .upsert(
          {
            repo_id,
            funder_id: match.funder_id,
            match_score: match.match_score,
            match_reasoning: match.reasoning,
          },
          { onConflict: "repo_id,funder_id" }
        )
        .select("*, funders(name, description, amount_range, application_type, application_url, focus_tags)")
        .single();

      storedMatches.push(stored);
    }

    return NextResponse.json({
      matches: storedMatches,
      provider,
    });
  } catch (err) {
    console.error("AI matching failed:", err);
    return NextResponse.json(
      { error: "AI matching failed. Please try again." },
      { status: 500 }
    );
  }
}

function buildMatchingPrompt(
  repo: any,
  funders: FunderRecord[]
): string {
  const funderList = funders
    .map(
      (f) =>
        `- id: ${f.id}\n  name: ${f.name}\n  focus: ${f.focus_tags.join(", ")}\n  type: ${f.application_type}\n  eligibility: ${f.eligibility_notes}\n  amount: ${f.amount_range}`
    )
    .join("\n");

  return `You match open source projects to funding programs based on genuine fit — not generic optimism. Be honest about weak matches.

Repo:
- name: ${repo.github_full_name}
- description: ${repo.description || "No description"}
- language: ${repo.primary_language || "Unknown"}
- criticality_score: ${repo.criticality_score}
- contributors: ${repo.contributors_count}
- stars: ${repo.stars}
- forks: ${repo.forks}

Funders:
${funderList}

Return ONLY a JSON array of objects with these keys:
- funder_id: the funder's id from the list above
- match_score: 0-100 (only above 40 if there's a real, explainable reason)
- reasoning: 1-2 sentences, specific to this repo — reference actual facts (language, purpose, criticality score), not generic statements

Return ONLY valid JSON, no markdown, no explanation.`;
}

function parseMatchResponse(content: string): MatchResult[] {
  try {
    // Try to extract JSON from the response (might have markdown wrapping)
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error("No JSON array found in AI response:", content);
      return [];
    }

    const parsed = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item: any) => ({
      funder_id: item.funder_id,
      match_score: Math.min(100, Math.max(0, parseInt(item.match_score) || 0)),
      reasoning: String(item.reasoning || ""),
    }));
  } catch (err) {
    console.error("Failed to parse AI response:", err);
    return [];
  }
}
