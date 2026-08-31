import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { isUserAdmin } from "@/lib/admin";

/**
 * Perform server-side live URL status check (returns { ok: boolean, status?: number, error?: string })
 */
async function checkUrlStatus(url: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (OSS-Funding-Matcher/1.0)";

  try {
    // Attempt HEAD request first
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      headers: { "User-Agent": userAgent },
      signal: AbortSignal.timeout(8000),
    }).catch(() => null);

    // If HEAD request was blocked or returned 405 Method Not Allowed, try GET
    if (!res || res.status === 405 || res.status === 403) {
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        headers: { "User-Agent": userAgent },
        signal: AbortSignal.timeout(8000),
      }).catch(() => null);
    }

    if (!res) {
      return { ok: false, error: "Network or connection error reaching URL" };
    }

    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
    };
  } catch (err: any) {
    return { ok: false, error: err?.message || "URL validation request timed out or failed" };
  }
}

/**
 * POST /api/admin/suggestions/approve
 * Body: { id: string, action: "approve" | "reject" }
 */
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const username = (session.user as any).username || session.user.name;

  if (!isUserAdmin(userId, username)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { id, action } = body;

  if (!id) {
    return NextResponse.json({ error: "Suggestion ID is required" }, { status: 400 });
  }

  // Fetch the suggestion row
  const { data: suggestion, error: fetchErr } = await supabase
    .from("funder_suggestions")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchErr || !suggestion) {
    return NextResponse.json({ error: "Suggestion not found" }, { status: 404 });
  }

  if (action === "reject") {
    const { error: updateErr } = await supabase
      .from("funder_suggestions")
      .update({ status: "rejected" })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: "rejected",
      message: "Funder suggestion rejected.",
    });
  }

  if (action === "approve") {
    // 1. Do a live fetch of the application_url server-side to confirm HTTP 200
    const urlCheck = await checkUrlStatus(suggestion.application_url);

    let copiedToFunders = false;
    let funderError = null;

    // 2. If it passes (200 OK), copy the row into the real funders table
    if (urlCheck.ok) {
      const { error: insertErr } = await supabase.from("funders").insert({
        name: suggestion.name,
        description: suggestion.description || null,
        application_url: suggestion.application_url,
        focus_tags: suggestion.focus_tags || [],
        eligibility_notes: suggestion.notes || null,
        application_type: "direct_application",
        amount_range: "Community Grant",
      });

      if (!insertErr) {
        copiedToFunders = true;
      } else {
        funderError = insertErr.message;
      }
    } else {
      funderError = urlCheck.error || `URL check returned status ${urlCheck.status}`;
    }

    // 3. Mark the suggestion 'approved' either way, so it's not re-reviewed
    const { error: updateErr } = await supabase
      .from("funder_suggestions")
      .update({ status: "approved" })
      .eq("id", id);

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      status: "approved",
      copiedToFunders,
      urlCheck,
      funderError,
      message: copiedToFunders
        ? "Suggestion approved and copied to funders registry!"
        : `Suggestion marked approved, but copying to registry was skipped (${funderError}).`,
    });
  }

  return NextResponse.json({ error: "Invalid action. Use 'approve' or 'reject'." }, { status: 400 });
}
