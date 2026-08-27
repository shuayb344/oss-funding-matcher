import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { isUserAdmin } from "@/lib/admin";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ isAdmin: false });
  }

  const userId = (session.user as any).id;
  const username = (session.user as any).username || session.user.name;

  const isAdmin = isUserAdmin(userId, username);

  return NextResponse.json({ isAdmin });
}
