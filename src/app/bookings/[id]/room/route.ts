import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Booking from "@/models/Booking";
import Consultation from "@/models/Consultation";
import { jitsiRoomName } from "@/lib/consult-session";

export async function POST(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await requireRole(["owner", "vet"]);

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await dbConnect();
  const booking = await Booking.findById(id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParty = [String(booking.ownerId), String(booking.vetId)].includes(s.id);
  if (!isParty) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const roomUrl = `jitsi:${jitsiRoomName(String(booking._id))}`;
  let consultation = await Consultation.findOne({ bookingId: booking._id });
  if (!consultation) {
    consultation = await Consultation.create({
      bookingId: booking._id,
      ownerId: booking.ownerId,
      vetId: booking.vetId,
      petId: booking.petId,
      mode: booking.mode ?? "video",
      status: "live",
      roomUrl,
      startedAt: new Date(),
    });
  } else if (!consultation.roomUrl) {
    consultation.roomUrl = roomUrl;
    await consultation.save();
  }

  return NextResponse.json({
    room: {
      bookingId: booking._id,
      ownerId: booking.ownerId,
      vetId: booking.vetId,
      mode: booking.mode,
      roomUrl: consultation.roomUrl,
      jitsiRoom: jitsiRoomName(String(booking._id)),
    },
    joinUrl:
      s.role === "vet"
        ? `/vet/consultations/${booking._id}`
        : `/owner/consultations/${booking._id}`,
  });
}
