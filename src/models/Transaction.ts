import mongoose, { Schema, models, model } from "mongoose";
const TransactionSchema = new Schema(
  {
    vetId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User" },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    petId: { type: Schema.Types.ObjectId, ref: "Pet" },
    kind: {
      type: String,
      enum: ["charge", "refund", "payout", "adjustment"],
      default: "charge",
      index: true,
    },
    description: { type: String, default: "", maxlength: 200 },
    amountCents: { type: Number, required: true }, // negative for refunds
    feeCents: { type: Number, default: 0 },
    netCents: { type: Number, default: 0 },
    currency: { type: String, default: "USD" },
    status: {
      type: String,
      enum: ["pending", "available", "paid", "failed"],
      default: "pending",
      index: true,
    },
    occurredAt: { type: Date, default: Date.now, index: true },
    payoutId: { type: String, default: "" },
  },
  { timestamps: true },
);
export default (models.Transaction as mongoose.Model<any>) ||
  model("Transaction", TransactionSchema);