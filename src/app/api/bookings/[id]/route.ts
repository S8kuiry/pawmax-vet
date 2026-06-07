import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Booking from "@/models/Booking";
import { notifyBookingEvent } from "@/lib/notifications";
import { releaseSlotForBooking } from "@/lib/slot-booking";

type Params = { params: Promise<{ id: string }> };

const statusSchema = z.enum([
  "pending",
  "confirmed",
  "in_progress",
  "completed",
  "cancelled",
  "declined",
  "no_show",
]);

const patchSchema = z.object({
  status: statusSchema.optional(),
});

async function findAuthorizedBooking(id: string, session: { id: string; role: string }) {
  await dbConnect();
  const q =
    session.role === "vet"
      ? { _id: id, vetId: session.id }
      : session.role === "admin"
        ? { _id: id }
        : { _id: id, ownerId: session.id };
  return Booking.findOne(q).lean();
}

export async function GET(_req: NextRequest, ctx: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const booking = await findAuthorizedBooking(id, session);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ booking });
}

export async function PATCH(req: NextRequest, ctx: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await dbConnect();
  const q =
    session.role === "vet"
      ? { _id: id, vetId: session.id }
      : { _id: id, ownerId: session.id };

  const booking = await Booking.findOneAndUpdate(
    q,
    { status: parsed.data.status },
    { new: true },
  ).lean();

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (parsed.data.status === "cancelled" || parsed.data.status === "declined") {
    await releaseSlotForBooking(id);
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
        console.error("booking patch notification error:", err);
      }
    }
  }

  return NextResponse.json({ booking });
}
