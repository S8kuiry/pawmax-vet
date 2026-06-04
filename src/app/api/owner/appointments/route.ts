import { NextResponse } from "next/server";

/** Legacy alias — use /api/bookings instead. */
export async function GET() {
  return NextResponse.json({ error: "Use GET /api/bookings" }, { status: 410 });
}

export async function POST() {
  return NextResponse.json({ error: "Use POST /api/bookings" }, { status: 410 });
}
