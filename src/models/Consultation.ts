import mongoose, { Schema, models, model } from "mongoose";
const ConsultationSchema = new Schema(
  {
    bookingId: { type: Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    vetId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    petId: { type: Schema.Types.ObjectId, ref: "Pet", required: true },
    status: {
      type: String,
      enum: ["queued", "live", "ended", "cancelled"],
      default: "queued",
      index: true,
    },
    mode: { type: String, enum: ["in-person", "video"], default: "video" },
    roomUrl: { type: String, default: "" }, // for video calls
    startedAt: Date,
    endedAt: Date,
    durationSeconds: { type: Number, default: 0 },
    // SOAP-style notes captured during consult
    subjective: { type: String, default: "" },
    objective: { type: String, default: "" },
    assessment: { type: String, default: "" },
    plan: { type: String, default: "" },
  },
  { timestamps: true },
);
export default (models.Consultation as mongoose.Model<any>) ||
  model("Consultation", ConsultationSchema);