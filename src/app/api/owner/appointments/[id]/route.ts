import { NextResponse } from "next/server";

/** Legacy alias — use /api/bookings/[id] instead. */
export async function GET() {
  return NextResponse.json({ error: "Use GET /api/bookings/[id]" }, { status: 410 });
}
