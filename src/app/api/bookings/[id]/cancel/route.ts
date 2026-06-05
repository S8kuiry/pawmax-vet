import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Booking from "@/models/Booking";
import { notifyBookingEvent } from "@/lib/notifications";
import { releaseSlotForBooking } from "@/lib/slot-booking";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  const { id } = await ctx.params;
  await dbConnect();

  const q =
    session.role === "vet"
      ? { _id: id, vetId: session.id }
      : { _id: id, ownerId: session.id };

  const booking = await Booking.findOneAndUpdate(
    q,
    { status: "cancelled" },
    { new: true },
  ).lean();

  if (booking) {
    await releaseSlotForBooking(id);
    try {
      await notifyBookingEvent("booking.cancelled", booking);
    } catch (err) {
      console.error("cancel notification error:", err);
    }
  }

  const redirectPath =
    session.role === "vet" ? "/vet/bookings" : "/owner/bookings?tab=cancelled";
  return NextResponse.redirect(new URL(redirectPath, req.url));
}
