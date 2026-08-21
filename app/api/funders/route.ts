import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

/**
 * GET /api/funders
 * Returns all funding programs. Public — no auth required.
 */
export async function GET() {
  const { data: funders, error } = await supabase
    .from("funders")
    .select("*")
    .order("name");

  if (error) {
    return NextResponse.json({ error: "Failed to load funders" }, { status: 500 });
  }

  return NextResponse.json({ funders: funders || [] });
}
