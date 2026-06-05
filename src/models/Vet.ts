import { Schema, model, models } from "mongoose";

const VetSchema = new Schema(
  {
    // Login & Registration
    name: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },

    phone: {
      type: String,
      required: true,
    },

    passwordHash: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      default: "vet",
    },

    // Profile (filled later)
    displayName: String,
    slug: { type: String, unique: true, sparse: true },
    photoUrl: String,
    bio: String,

    languages: [String],
    specializations: [String],
    speciesExpertise: [String],

    yearsOfExperience: {
      type: Number,
      default: 0,
    },

    qualifications: [
      {
        degree: String,
        institute: String,
        year: Number,
      },
    ],

    // Verification
    licenseNumber: String,
    licenseState: String,
    licenseExpiry: Date,

    kycStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },

    kycDocs: [
      {
        type: { type: String },
        url: String,
        uploadedAt: Date,
      },
    ],

    // Commercial
    consultationFee: {
      type: Number,
      default: 0,
    },

    followUpFee: {
      type: Number,
      default: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    modes: [String],

    clinicAddress: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
      geo: {
        lat: Number,
        lng: Number,
      },
    },

    // Razorpay
    razorpayAccountId: String,
    payoutHoldDays: {
      type: Number,
      default: 2,
    },

    // Stats
    rating: {
      type: Number,
      default: 0,
    },

    ratingCount: {
      type: Number,
      default: 0,
    },

    totalConsultations: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["draft", "active", "paused", "suspended"],
      default: "draft",
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default models.Vet || model("Vet", VetSchema);