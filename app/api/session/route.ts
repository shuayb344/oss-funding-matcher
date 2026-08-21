import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

/**
 * GET /api/auth/session
 * Returns the current session for client components to consume.
 */
export async function GET() {
  const session = await auth();

  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json(session);
}
