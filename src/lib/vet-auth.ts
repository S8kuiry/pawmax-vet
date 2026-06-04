import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
/**
 * Guard for vet-only API routes. Returns either an authenticated session
 * with role === "vet", or a NextResponse to short-circuit the handler.
 *
 * Usage:
 *   const guard = await requireVet();
 *   if (guard instanceof NextResponse) return guard;
 *   const { session } = guard;
 */
export async function requireVet() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "vet") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { session };
}
export function badRequest(message: string, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status: 400 });
}
export function notFound(message = "Not found") {
  return NextResponse.json({ error: message }, { status: 404 });
}