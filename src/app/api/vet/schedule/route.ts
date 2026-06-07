import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Booking from "@/models/Booking";
const querySchema = z.object({
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});
export async function GET(req: Request) {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  const from = parsed.data.from ? new Date(parsed.data.from) : new Date();
  const to = parsed.data.to
    ? new Date(parsed.data.to)
    : new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
  await dbConnect();
  const items = await Booking.find({
    vetId: guard.session.id,
    status: { $in: ["confirmed", "in_progress"] },
    startAt: { $gte: from, $lte: to },
  })
    .sort({ startAt: 1 })
    .lean();
  return NextResponse.json({ from, to, items });
}
