import { Schema, model, models, Types } from "mongoose";

const VetSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true, unique: true },

  // Public profile
  displayName: { type: String, required: true },
  slug: { type: String, unique: true, index: true },
  photoUrl: String,
  bio: String,
  languages: [String],                                    // ["English","Hindi"]
  specializations: [String],                              // ["Dermatology","Surgery"]
  speciesExpertise: [{ type: String, enum: ["Dog","Cat","Rabbit","Bird","Reptile","Exotic"] }],
  yearsOfExperience: { type: Number, default: 0 },
  qualifications: [{ degree: String, institute: String, year: Number }],

  // Regulatory
  licenseNumber: { type: String, required: true },
  licenseState: String,
  licenseExpiry: Date,
  kycStatus: { type: String, enum: ["pending","verified","rejected"], default: "pending" },
  kycDocs: [{ type: { type: String }, url: String, uploadedAt: Date }],

  // Commercial
  consultationFee: { type: Number, required: true },     // INR
  followUpFee: Number,
  currency: { type: String, default: "INR" },
  modes: [{ type: String, enum: ["video","chat","clinic"] }],
  clinicAddress: { line1:String, city:String, state:String, pincode:String, geo:{lat:Number,lng:Number} },

  // Payouts (Razorpay Route)
  razorpayAccountId: String,                              // acc_XXXX linked account
  payoutHoldDays: { type: Number, default: 2 },

  // Stats
  rating: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
  totalConsultations: { type: Number, default: 0 },

  status: { type: String, enum: ["draft","active","paused","suspended"], default: "draft" },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

VetSchema.index({ specializations: 1, status: 1 });
VetSchema.index({ "clinicAddress.city": 1 });

export default models.Vet || model("Vet", VetSchema);
