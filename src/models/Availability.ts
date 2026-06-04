import { Schema, model, models, Types } from "mongoose";

const SlotSchema = new Schema({
  start: { type: String, required: true },                // "09:00"
  end:   { type: String, required: true },                // "13:00"
}, { _id: false });

const AvailabilitySchema = new Schema({
  vetId: { type: Types.ObjectId, ref: "Vet", required: true, unique: true },

  timezone: { type: String, default: "Asia/Kolkata" },
  slotDurationMin: { type: Number, default: 15 },
  bufferMin: { type: Number, default: 5 },
  advanceBookingDays: { type: Number, default: 14 },

  weekly: {                                               // 0=Sun .. 6=Sat
    "0": [SlotSchema], "1": [SlotSchema], "2": [SlotSchema],
    "3": [SlotSchema], "4": [SlotSchema], "5": [SlotSchema], "6": [SlotSchema],
  },

  overrides: [{                                           // single-day overrides
    date: { type: Date, required: true },
    slots: [SlotSchema],
    isClosed: { type: Boolean, default: false },
    reason: String,
  }],

  blocks: [{                                              // ad-hoc unavailable ranges
    startAt: Date, endAt: Date, reason: String,
  }],
}, { timestamps: true });

export default models.Availability || model("Availability", AvailabilitySchema);
