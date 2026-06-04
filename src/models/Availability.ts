import mongoose, { Schema, models, model } from "mongoose";
/**
 * Weekly recurring availability + blackout dates for a vet.
 * One document per vet.
 */
const DayHoursSchema = new Schema(
  {
    day: { type: Number, min: 0, max: 6, required: true }, // 0 = Sunday
    open: { type: Boolean, default: true },
    start: { type: String, default: "09:00" }, // "HH:mm"
    end: { type: String, default: "18:00" },
    breaks: [
      {
        start: String,
        end: String,
      },
    ],
  },
  { _id: false },
);
const BlackoutSchema = new Schema(
  {
    date: { type: Date, required: true },
    reason: { type: String, default: "" },
  },
  { _id: true },
);
const AvailabilitySchema = new Schema(
  {
    vetId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    timezone: { type: String, default: "UTC" },
    slotMinutes: { type: Number, default: 30, min: 10, max: 240 },
    weeklyHours: { type: [DayHoursSchema], default: [] },
    blackouts: { type: [BlackoutSchema], default: [] },
  },
  { timestamps: true },
);
export default (models.Availability as mongoose.Model<any>) ||
  model("Availability", AvailabilitySchema);