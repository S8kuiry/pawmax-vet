import mongoose, { Schema, models, model } from "mongoose";
import { generateBookingCode } from "@/lib/booking-code";

const BookingSchema = new Schema(
  {
    bookingCode: { type: String, unique: true, index: true },
    vetId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petId: { type: Schema.Types.ObjectId, ref: "Pet", required: true, index: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service" },
    slotId: { type: Schema.Types.ObjectId, ref: "Slot", index: true },
    startAt: { type: Date, required: true, index: true },
    endAt: { type: Date, required: true },
    mode: { type: String, enum: ["in-person", "video"], default: "in-person" },
    reason: { type: String, default: "", maxlength: 500 },
    notes: { type: String, default: "", maxlength: 2000 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "in_progress", "completed", "cancelled", "declined", "no_show"],
      default: "pending",
      index: true,
    },
    priceCents: { type: Number, min: 0, default: 0 },
    currency: { type: String, default: "USD" },
    // Snapshot for fast list rendering
    patientName: { type: String, default: "" },
    ownerName: { type: String, default: "" },
  },
  { timestamps: true },
);
BookingSchema.index({ vetId: 1, startAt: 1 });

// Mongoose 9+ — no `next` callback; sync middleware runs before save
BookingSchema.pre("save", function () {
  if (!this.bookingCode) {
    this.bookingCode = generateBookingCode();
  }
});

// Next.js hot-reload caches models — drop stale Booking so bookingCode is always in schema
if (models.Booking) {
  delete models.Booking;
}

export default model("Booking", BookingSchema);