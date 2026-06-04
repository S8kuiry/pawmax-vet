import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function requireOwner() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { session };
}
