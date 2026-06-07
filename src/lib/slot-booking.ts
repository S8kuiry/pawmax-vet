import Slot from "@/models/Slot";
import Booking from "@/models/Booking";

export async function releaseSlotForBooking(bookingId: string) {
  return Slot.findOneAndUpdate(
    { bookingId },
    { $set: { status: "available", bookingId: null } },
  );
}

export async function hasVetConflict(
  vetId: string,
  startAt: Date,
  endAt: Date,
  excludeBookingId?: string,
) {
  const q: Record<string, unknown> = {
    vetId,
    status: { $in: ["confirmed", "in_progress"] },
    startAt: { $lt: endAt },
    endAt: { $gt: startAt },
  };
  if (excludeBookingId) q._id = { $ne: excludeBookingId };

  const conflict = await Booking.findOne(q).select("_id").lean();
  return !!conflict;
}

export async function claimSlot(slotId: string, vetId: string, bookingId: string) {
  return Slot.findOneAndUpdate(
    { _id: slotId, vetId, status: "available" },
    { $set: { status: "booked", bookingId } },
    { new: true },
  );
}
