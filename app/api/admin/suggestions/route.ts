import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { isUserAdmin } from "@/lib/admin";

/**
 * GET /api/admin/suggestions — Fetch funder suggestions for admin review
 */
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const username = (session.user as any).username || session.user.name;

  if (!isUserAdmin(userId, username)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await supabase
    .from("funder_suggestions")
    .select("*, users:submitted_by(username, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) {
    // If join fails or table doesn't exist, try querying without relation
    const { data: simpleData, error: simpleErr } = await supabase
      .from("funder_suggestions")
      .select("*")
      .order("created_at", { ascending: false });

    if (simpleErr) {
      return NextResponse.json({ suggestions: [], error: simpleErr.message });
    }
    return NextResponse.json({ suggestions: simpleData || [] });
  }

  return NextResponse.json({ suggestions: data || [] });
}
