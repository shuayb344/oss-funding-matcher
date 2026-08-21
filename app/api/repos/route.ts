import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

/**
 * GET /api/repos
 * Fetches the authenticated user's repos from Supabase.
 * Repos are stored/updated when the user triggers a sync (future endpoint).
 */
export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Find the user in our database
  const { data: dbUser } = await supabase
    .from("users")
    .select("id")
    .eq("github_id", session.user.id)
    .single();

  if (!dbUser) {
    return NextResponse.json({ repos: [] });
  }

  // Fetch their repos, sorted by criticality score
  const { data: repos } = await supabase
    .from("repos")
    .select("*")
    .eq("user_id", dbUser.id)
    .order("criticality_score", { ascending: false });

  return NextResponse.json({ repos: repos || [] });
}
