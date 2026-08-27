import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/db";
import { isUserAdmin } from "@/lib/admin";

/**
 * POST /api/admin/funders — Create a new funder
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
  const { name, description, amount_range, focus_tags, application_type, eligibility_notes, application_url, region_restriction } = body;

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("funders")
    .insert({
      name,
      description: description || null,
      amount_range: amount_range || null,
      focus_tags: focus_tags || [],
      application_type: application_type || "direct_application",
      eligibility_notes: eligibility_notes || null,
      application_url: application_url || null,
      region_restriction: region_restriction || null,
    })
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ funder: data });
}

/**
 * PATCH /api/admin/funders — Update a funder
 */
export async function PATCH(request: NextRequest) {
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
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("funders")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ funder: data });
}

/**
 * DELETE /api/admin/funders — Delete a funder
 */
export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;
  const username = (session.user as any).username || session.user.name;

  if (!isUserAdmin(userId, username)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await request.json();

  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }

  const { error } = await supabase.from("funders").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
