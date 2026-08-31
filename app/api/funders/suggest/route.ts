import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";

/**
 * POST /api/funders/suggest — Submit a funder suggestion
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, application_url, description, focus_tags, notes } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Funder name is required" }, { status: 400 });
    }

    if (!application_url || typeof application_url !== "string" || !application_url.trim()) {
      return NextResponse.json({ error: "Application URL is required" }, { status: 400 });
    }

    // Basic URL format validation
    let validUrl = application_url.trim();
    if (!validUrl.startsWith("http://") && !validUrl.startsWith("https://")) {
      validUrl = `https://${validUrl}`;
    }

    // Resolve authenticated user ID if logged in
    const session = await auth();
    let submittedBy: string | null = null;

    if (session?.user) {
      const githubId = (session.user as any).id || (session.user as any).githubId;
      if (githubId) {
        const { data: dbUser } = await supabase
          .from("users")
          .select("id")
          .eq("github_id", String(githubId))
          .maybeSingle();

        if (dbUser?.id) {
          submittedBy = dbUser.id;
        }
      }
    }

    // Insert into funder_suggestions table with status 'pending'
    const { data, error } = await supabase
      .from("funder_suggestions")
      .insert({
        submitted_by: submittedBy,
        name: name.trim(),
        description: description?.trim() || null,
        application_url: validUrl,
        focus_tags: Array.isArray(focus_tags) ? focus_tags : [],
        notes: notes?.trim() || null,
        status: "pending",
      })
      .select("*")
      .single();

    if (error) {
      console.error("Error inserting funder suggestion:", error);
      return NextResponse.json(
        { error: "Failed to submit funder suggestion: " + error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      suggestion: data,
      message: "Thank you! Your funder suggestion has been submitted for review.",
    });
  } catch (err: any) {
    console.error("Unexpected error in /api/funders/suggest:", err);
    return NextResponse.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
