import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";
import Booking from "@/models/Booking";
import Pet from "@/models/Pet";
import Slot from "@/models/Slot";
import User from "@/models/User";
import { findVetById } from "@/lib/vet-resolve";
import { ensureConsultThread } from "@/lib/consult-session";
import { notifyBookingEvent } from "@/lib/notifications";
import { claimSlot, hasVetConflict } from "@/lib/slot-booking";
import { generateBookingCode } from "@/lib/booking-code";

const createSchema = z
  .object({
    vetId: z.string().min(1),
    petId: z.string().min(1),
    slotId: z.string().min(1).optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    mode: z.enum(["in-person", "video"]).optional(),
    reason: z.string().max(500).optional(),
  })
  .refine((d) => d.slotId || d.startAt, {
    message: "Either slotId or startAt is required",
  });

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const q: Record<string, unknown> =
    session.role === "vet" ? { vetId: session.id } : { ownerId: session.id };
  if (status) q.status = status;

  const bookings = await Booking.find(q).sort({ startAt: -1 }).limit(100).lean();
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole("owner");
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = createSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", issues: parsed.error.flatten() },
        { status: 400 },
      );
    }

    await dbConnect();

    const [pet, vet] = await Promise.all([
      Pet.findOne({ _id: parsed.data.petId, ownerId: session.id }).lean(),
      findVetById(parsed.data.vetId),
    ]);
    if (!pet) return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    if (!vet) return NextResponse.json({ error: "Vet not found" }, { status: 404 });

    let startAt: Date;
    let endAt: Date;
    let slotId: string | undefined;

    if (parsed.data.slotId) {
      if (!isValidObjectId(parsed.data.slotId)) {
        return NextResponse.json({ error: "Invalid slot id" }, { status: 400 });
      }

      const slot = await Slot.findOne({
        _id: parsed.data.slotId,
        vetId: parsed.data.vetId,
        status: "available",
      }).lean();

      if (!slot) {
        return NextResponse.json({ error: "Slot not available" }, { status: 409 });
      }

      startAt = new Date(slot.startTime as Date);
      endAt = new Date(slot.endTime as Date);
      slotId = parsed.data.slotId;
    } else {
      startAt = new Date(parsed.data.startAt!);
      endAt = parsed.data.endAt
        ? new Date(parsed.data.endAt)
        : new Date(startAt.getTime() + 30 * 60 * 1000);
    }

    if (endAt <= startAt) {
      return NextResponse.json({ error: "endAt must be after startAt" }, { status: 400 });
    }

    const conflict = await hasVetConflict(parsed.data.vetId, startAt, endAt);
    if (conflict) {
      return NextResponse.json({ error: "This time slot is no longer available" }, { status: 409 });
    }

    const owner = await User.findById(session.id).select("name").lean();
    const priceCents = vet.consultationFee ? Math.round(vet.consultationFee * 100) : 0;

    const booking = await Booking.create({
      bookingCode: generateBookingCode(),
      vetId: parsed.data.vetId,
      ownerId: session.id,
      petId: parsed.data.petId,
      slotId,
      startAt,
      endAt,
      mode: parsed.data.mode ?? "video",
      reason: parsed.data.reason ?? "",
      status: "confirmed",
      patientName: pet.name,
      ownerName: owner?.name ?? session.email,
      priceCents,
      currency: "INR",
    });

    if (slotId) {
      const claimed = await claimSlot(slotId, parsed.data.vetId, String(booking._id));
      if (!claimed) {
        await Booking.findByIdAndDelete(booking._id);
        return NextResponse.json({ error: "Slot was just booked by someone else" }, { status: 409 });
      }
    }

    try {
      const bookingObj = booking.toObject();
      await ensureConsultThread(bookingObj);
      await notifyBookingEvent("booking.confirmed", bookingObj);
    } catch (err) {
      console.error("booking notification error:", err);
    }

    return NextResponse.json({ booking }, { status: 201 });
  } catch (err: unknown) {
    console.error("POST /api/bookings:", err);
    const message = err instanceof Error ? err.message : "Booking failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
