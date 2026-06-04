import { Schema, model, models, Types } from "mongoose";

const MedicationSchema = new Schema({
  name: { type: String, required: true },
  form: { type: String, enum: ["tablet","syrup","injection","topical","drops","powder","other"] },
  strength: String,                                       // "5mg/ml"
  dose: String,                                           // "0.5 ml"
  route: { type: String, enum: ["oral","topical","sc","im","iv","otic","ophthalmic"] },
  frequency: String,                                      // "BID", "every 8h"
  durationDays: Number,
  instructions: String,
}, { _id: false });

const PrescriptionSchema = new Schema({
  rxNumber: { type: String, unique: true, index: true },
  consultationId: { type: Types.ObjectId, ref: "Consultation", required: true },
  bookingId:      { type: Types.ObjectId, ref: "Booking", required: true },
  vetId:          { type: Types.ObjectId, ref: "Vet", required: true },
  petId:          { type: Types.ObjectId, ref: "Pet", required: true },
  customerId:     { type: Types.ObjectId, ref: "User", required: true },

  medications: [MedicationSchema],
  diet: String,
  generalAdvice: String,
  followUpAt: Date,

  pdfUrl: String,                                         // S3 URL
  signedBy: { vetName:String, licenseNumber:String, signedAt:Date },

  status: { type: String, enum: ["draft","issued","revoked"], default: "issued" },
}, { timestamps: true });

export default models.Prescription || model("Prescription", PrescriptionSchema);
