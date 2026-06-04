import mongoose, { Schema, models, model } from "mongoose";
const AttachmentSchema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String, default: "" },
    mimeType: { type: String, default: "" },
    sizeBytes: { type: Number, default: 0 },
  },
  { _id: true },
);
const MedicalRecordSchema = new Schema(
  {
    vetId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petId: { type: Schema.Types.ObjectId, ref: "Pet", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking" },
    type: {
      type: String,
      enum: ["soap", "vaccine", "lab", "surgery", "imaging", "note"],
      default: "soap",
      index: true,
    },
    date: { type: Date, default: Date.now, index: true },
    summary: { type: String, default: "", maxlength: 500 },
    body: { type: String, default: "", maxlength: 10000 },
    // SOAP fields (used when type === "soap")
    subjective: { type: String, default: "" },
    objective: { type: String, default: "" },
    assessment: { type: String, default: "" },
    plan: { type: String, default: "" },
    // Vaccine-specific
    vaccineName: { type: String, default: "" },
    vaccineLot: { type: String, default: "" },
    vaccineExpiresAt: Date,
    attachments: { type: [AttachmentSchema], default: [] },
  },
  { timestamps: true },
);
export default (models.MedicalRecord as mongoose.Model<any>) ||
  model("MedicalRecord", MedicalRecordSchema);