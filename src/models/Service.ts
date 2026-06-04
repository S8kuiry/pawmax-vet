import mongoose, { Schema, models, model } from "mongoose";
const ServiceSchema = new Schema(
  {
    vetId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, maxlength: 120 },
    description: { type: String, default: "", maxlength: 1000 },
    durationMinutes: { type: Number, required: true, min: 5, max: 480 },
    priceCents: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "USD", maxlength: 3 },
    mode: {
      type: String,
      enum: ["in-person", "video", "either"],
      default: "either",
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);
export default (models.Service as mongoose.Model<any>) ||
  model("Service", ServiceSchema);
