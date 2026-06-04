import { Schema, model, models, Types } from "mongoose";

const MedicalRecordSchema = new Schema({
  petId:   { type: Types.ObjectId, ref: "Pet", required: true, index: true },
  vetId:   { type: Types.ObjectId, ref: "User" },
  bookingId:{ type: Types.ObjectId, ref: "Booking" },
  date:    { type: Date, default: Date.now },
  type:    { type: String, enum: ["Visit","Vaccine","Surgery","Lab","Prescription","Note"], required: true },
  summary: { type: String, required: true, maxlength: 200 },
  notes:   { type: String, maxlength: 4000 },
  attachments: [{ name: String, url: String }],
  prescription: [{
    drug: String, dose: String, frequency: String, durationDays: Number,
  }],
}, { timestamps: true });

export default models.MedicalRecord || model("MedicalRecord", MedicalRecordSchema);
