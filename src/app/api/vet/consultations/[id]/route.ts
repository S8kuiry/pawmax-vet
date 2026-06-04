import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Consultation from "@/models/Consultation";
import Booking from "@/models/Booking";
const patchSchema = z.object({
  action: z.enum(["start", "end", "cancel"]).optional(),
  subjective: z.string().max(5000).optional(),
  objective: z.string().max(5000).optional(),
  assessment: z.string().max(5000).optional(),
  plan: z.string().max(5000).optional(),
  roomUrl: z.string().url().max(500).optional(),
});
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await dbConnect();
  const c = await Consultation.findOne({ _id: params.id, vetId: guard.session.id }).lean();
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ consultation: c });
}
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  await dbConnect();
  const c = await Consultation.findOne({ _id: params.id, vetId: guard.session.id });
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const { action, ...notes } = parsed.data;
  Object.assign(c, notes);
  if (action === "start") {
    c.status = "live";
    c.startedAt = new Date();
    await Booking.findByIdAndUpdate(c.bookingId, { status: "in_progress" });
  } else if (action === "end") {
    c.status = "ended";
    c.endedAt = new Date();
    if (c.startedAt) {
      c.durationSeconds = Math.floor((c.endedAt.getTime() - c.startedAt.getTime()) / 1000);
    }
    await Booking.findByIdAndUpdate(c.bookingId, { status: "completed" });
  } else if (action === "cancel") {
    c.status = "cancelled";
    await Booking.findByIdAndUpdate(c.bookingId, { status: "cancelled" });
  }
  await c.save();
  return NextResponse.json({ consultation: c.toObject() });
}