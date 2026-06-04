import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Booking from "@/models/Booking";
import ConsultationRoom from "@/models/ConsultationRoom";
import { createDailyRoom, createMeetingToken } from "@/lib/daily";

export async function POST(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await requireRole(["owner","vet"]);
  await dbConnect();
  const booking = await Booking.findById(id);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const isParty = [String(booking.customerId), String(booking.vetId)].includes(s.id);
  if (!isParty) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let room = await ConsultationRoom.findOne({ bookingId: booking._id });
  if (!room) {
    const mode = booking.mode || "video";
    let dailyRoomUrl: string | undefined, dailyRoomName: string | undefined;
    if (mode === "video") {
      const created = await createDailyRoom(`pv-${booking._id}`);
      dailyRoomUrl = created.url; dailyRoomName = created.name;
    }
    room = await ConsultationRoom.create({
      bookingId: booking._id, ownerId: booking.customerId, vetId: booking.vetId,
      mode, dailyRoomUrl, dailyRoomName,
    });
  }

  let token: string | undefined;
  if (room.mode === "video" && room.dailyRoomName) {
    token = await createMeetingToken(room.dailyRoomName, s.email, s.role === "vet");
  }
  return NextResponse.json({ room, token });
}
