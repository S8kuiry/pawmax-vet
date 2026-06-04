import { Schema, model, models, Types } from "mongoose";

const BookingSchema = new Schema({
  bookingCode: { type: String, unique: true, index: true }, // e.g. PMX-VET-000123

  customerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  petId:      { type: Types.ObjectId, ref: "Pet",  required: true },
  vetId:      { type: Types.ObjectId, ref: "Vet",  required: true, index: true },

  mode: { type: String, enum: ["video","chat","clinic"], required: true },
  reason: { type: String, required: true },
  symptoms: [String],
  attachments: [{ url: String, name: String, type: String }],

  scheduledStart: { type: Date, required: true, index: true },
  scheduledEnd:   { type: Date, required: true },
  durationMin: { type: Number, default: 15 },

  // Pricing snapshot at booking time
  amount:        { type: Number, required: true },
  platformFee:   { type: Number, default: 0 },
  vetEarning:    { type: Number, default: 0 },
  gstAmount:     { type: Number, default: 0 },
  currency:      { type: String, default: "INR" },
  couponCode:    String,
  discount:      { type: Number, default: 0 },

  paymentId:  { type: Types.ObjectId, ref: "Payment" },
  paymentStatus: { type: String, enum: ["pending","paid","refunded","failed"], default: "pending" },

  status: {
    type: String,
    enum: ["pending_payment","confirmed","in_progress","completed","cancelled","no_show","refunded"],
    default: "pending_payment",
    index: true,
  },
  cancellation: { by: String, reason: String, at: Date, refundAmount: Number },

  consultationId: { type: Types.ObjectId, ref: "Consultation" },
  remindersSent: { t24h:Boolean, t1h:Boolean, t10m:Boolean },
}, { timestamps: true });

BookingSchema.index({ vetId: 1, scheduledStart: 1 });

export default models.Booking || model("Booking", BookingSchema);
