import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Booking from "@/models/Booking";
import { notifyBookingEvent } from "@/lib/notifications";
import { releaseSlotForBooking } from "@/lib/slot-booking";

const updateSchema = z.object({
  status: z
    .enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "declined", "no_show"])
    .optional(),
  startAt: z.string().datetime().optional(),
  endAt: z.string().datetime().optional(),
  mode: z.enum(["in-person", "video"]).optional(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  priceCents: z.number().int().min(0).optional(),
});

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await dbConnect();
  const booking = await Booking.findOne({ _id: params.id, vetId: guard.session.id }).lean();
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ booking });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  const update: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.startAt) update.startAt = new Date(parsed.data.startAt);
  if (parsed.data.endAt) update.endAt = new Date(parsed.data.endAt);
  await dbConnect();
  const booking = await Booking.findOneAndUpdate(
    { _id: params.id, vetId: guard.session.id },
    update,
    { new: true, runValidators: true },
  ).lean();
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.status === "cancelled" || parsed.data.status === "declined") {
    await releaseSlotForBooking(params.id);
  }

  if (parsed.data.status) {
    const eventMap: Record<string, "booking.confirmed" | "booking.completed" | "booking.cancelled" | null> = {
      confirmed: "booking.confirmed",
      completed: "booking.completed",
      cancelled: "booking.cancelled",
    };
    const event = eventMap[parsed.data.status];
    if (event) {
      try {
        await notifyBookingEvent(event, booking);
      } catch (err) {
        console.error("vet booking patch notification error:", err);
      }
    }
  }

  return NextResponse.json({ booking });
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await dbConnect();
  const booking = await Booking.findOneAndUpdate(
    { _id: params.id, vetId: guard.session.id },
    { status: "cancelled" },
    { new: true },
  ).lean();
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await releaseSlotForBooking(params.id);
  try {
    await notifyBookingEvent("booking.cancelled", booking);
  } catch (err) {
    console.error("vet booking delete notification error:", err);
  }

  return NextResponse.json({ booking });
}
