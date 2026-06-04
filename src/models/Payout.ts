import { Schema, model, models, Types } from "mongoose";

const PayoutSchema = new Schema({
  vetId:   { type: Types.ObjectId, ref: "User", required: true, index: true },
  periodStart: Date, periodEnd: Date,
  bookingIds: [{ type: Types.ObjectId, ref: "Booking" }],
  grossAmount: Number, platformFee: Number, gst: Number, netAmount: Number,
  status: { type: String, enum: ["pending","processing","paid","failed"], default: "pending" },
  razorpayPayoutId: String,
  paidAt: Date,
}, { timestamps: true });

export default models.Payout || model("Payout", PayoutSchema);
