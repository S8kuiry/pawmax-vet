import { Schema, model, models, Types } from "mongoose";



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
 
  specialty: String,
  licenseNumber: String,

  isPhoneVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },

  address: { type: String },
  defaultPetId: { type: Types.ObjectId, ref: "Pet" },

  acceptsWhatsApp: { type: Boolean, default: true },
  acceptsEmail: { type: Boolean, default: true },
  lastLoginAt: Date,
  status: { type: String, enum: ["active", "blocked", "deleted"], default: "active" },
  emergencyContact: { type: String },
  
}, { timestamps: true });

export default models.User || model("User", UserSchema);
