import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { callAI } from "@/lib/ai";
import { rateLimitOrContinue } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface PitchInput {
  match_id: string;
}

/**
 * POST /api/pitch
 * Body: { match_id: string }
 *
 * Generates a tailored pitch for a specific repo/funder match.
 * The user can then copy, edit, and send it.
 */
export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { response } = rateLimitOrContinue(`pitch:${session.user.id}`, 20, 60_000);
  if (response) return response;

  const body: PitchInput = await request.json();
  const { match_id } = body;

  if (!match_id) {
    return NextResponse.json({ error: "match_id is required" }, { status: 400 });
  }

  const { data: match } = await supabase
    .from("matches")
    .select(`
      *,
      repos (
        github_full_name,
        description,
        primary_language,
        criticality_score,
        contributors_count,
        stars,
        forks,
        commit_frequency,
        users!inner(github_id)
      ),
      funders (
        name,
        description,
        focus_tags,
        application_type,
        eligibility_notes,
        amount_range,
        application_url
      )
    `)
    .eq("id", match_id)
    .single();

  if (!match) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const repo = match.repos as any;
  const funder = match.funders as any;
  if (repo.users?.github_id !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const prompt = buildPitchPrompt(repo, funder, match.match_reasoning);

  try {
    const { content, provider } = await callAI(prompt);

    const { data: pitch } = await supabase
      .from("pitches")
      .insert({
        match_id,
        draft_text: content,
      })
      .select("*")
      .single();

    return NextResponse.json({
      pitch,
      provider,
    });
  } catch (err) {
    console.error("Pitch generation failed:", err);
    return NextResponse.json(
      { error: "Pitch generation failed. Please try again." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { pitch_id, edited_text } = await request.json();

  if (!pitch_id || edited_text === undefined) {
    return NextResponse.json(
      { error: "pitch_id and edited_text are required" },
      { status: 400 }
    );
  }

  const { data: pitch } = await supabase
    .from("pitches")
    .select("id, match_id, matches!inner(repo_id, repos!inner(user_id, users!inner(github_id)))")
    .eq("id", pitch_id)
    .single();

  if (!pitch) {
    return NextResponse.json({ error: "Pitch not found" }, { status: 404 });
  }

  const matches = pitch.matches as any;
  if (matches?.repos?.users?.github_id !== session.user.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { data: updated } = await supabase
    .from("pitches")
    .update({ edited_text })
    .eq("id", pitch_id)
    .select("*")
    .single();

  return NextResponse.json({ pitch: updated });
}

function buildPitchPrompt(repo: any, funder: any, matchReasoning: string): string {
  const isNominationBased = funder.application_type === "nomination_based";

  const nominationNote = isNominationBased
    ? `\n\nIMPORTANT: This funder is nomination-based. Frame this as an outreach message to a potential internal nominator or as a public visibility pitch — NOT a formal application. Be honest that this is about getting noticed, not submitting a form.`
    : "";

  return `You help open source maintainers write honest, specific funding pitches.
Never invent facts about the project. Use only the data provided.

Repo details:
- name: ${repo.github_full_name}
- description: ${repo.description || "No description"}
- language: ${repo.primary_language || "Unknown"}
- criticality_score: ${repo.criticality_score}
- contributors: ${repo.contributors_count}
- stars: ${repo.stars}
- forks: ${repo.forks}
- recent commits (90 days): ${repo.commit_frequency}

Funder:
- name: ${funder.name}
- focus: ${funder.focus_tags?.join(", ") || "general"}
- type: ${funder.application_type}
- eligibility: ${funder.eligibility_notes}
- amount: ${funder.amount_range}

Match reasoning from previous step: ${matchReasoning}
${nominationNote}

Write a draft pitch (150-250 words) covering:
1. What the project does and why it matters (grounded in real facts from above)
2. Evidence of usage/impact (criticality score, contributor count, stars, etc.)
3. What funding would specifically be used for (be concrete: security audits, CI/CD, documentation, dependency maintenance)
4. A clear, specific ask

Use a professional but genuine tone. No buzzwords, no fluff. Write like a maintainer who cares about their project, not a marketer.`;
}
