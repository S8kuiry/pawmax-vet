import { Schema, model, models, Types } from "mongoose";

const AddressSchema = new Schema({
  label: { type: String, default: "Home" },
  line1: String, line2: String,
  city: String, state: String, pincode: String,
  country: { type: String, default: "IN" },
  geo: { lat: Number, lng: Number },
}, { _id: false });

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true, lowercase: true, index: true },
  phone: { type: String, unique: true, sparse: true, index: true },
  passwordHash: String,
  googleId: { type: String, sparse: true },
  avatarUrl: String,

  role: {
    type: String,
    enum: ["owner", "vet", "admin", "customer", "support"],
    default: "owner",
  },
  kycStatus: {
    type: String,
    enum: ["pending", "verified", "rejected", "n/a"],
    default: "n/a",
  },
  specialty: String,
  licenseNumber: String,

  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },

  addresses: [AddressSchema],
  defaultPetId: { type: Types.ObjectId, ref: "Pet" },

  acceptsWhatsApp: { type: Boolean, default: true },
  acceptsEmail: { type: Boolean, default: true },
  lastLoginAt: Date,
  status: { type: String, enum: ["active", "blocked", "deleted"], default: "active" },
  
}, { timestamps: true });

export default models.User || model("User", UserSchema);
