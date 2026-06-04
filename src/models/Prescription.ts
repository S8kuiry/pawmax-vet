import mongoose, { Schema, models, model } from "mongoose";
const PrescriptionSchema = new Schema(
  {
    vetId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petId: { type: Schema.Types.ObjectId, ref: "Pet", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    drug: { type: String, required: true, maxlength: 200 },
    strength: { type: String, default: "", maxlength: 80 },        // e.g. "62.5mg"
    form: { type: String, default: "", maxlength: 40 },            // tab, drop, suspension
    dose: { type: String, required: true, maxlength: 200 },        // e.g. "1 tab"
    frequency: { type: String, default: "", maxlength: 120 },      // "twice daily"
    durationDays: { type: Number, min: 0 },
    route: { type: String, default: "", maxlength: 40 },           // oral, topical, IV
    quantity: { type: Number, min: 0, default: 0 },
    refills: { type: Number, min: 0, default: 0 },
    instructions: { type: String, default: "", maxlength: 2000 },
    issuedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
      index: true,
    },
    pdfUrl: { type: String, default: "" },
  },
  { timestamps: true },
);
export default (models.Prescription as mongoose.Model<any>) ||
  model("Prescription", PrescriptionSchema);