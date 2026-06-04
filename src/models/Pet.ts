import mongoose, { Schema, models, model } from "mongoose";
const PetSchema = new Schema(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, maxlength: 80 },
    species: { type: String, required: true, maxlength: 40 }, // dog, cat, rabbit...
    breed: { type: String, default: "", maxlength: 80 },
    sex: { type: String, enum: ["male", "female", "unknown"], default: "unknown" },
    birthDate: { type: Date },
    weightKg: { type: Number, min: 0, max: 500 },
    color: { type: String, default: "", maxlength: 40 },
    microchip: { type: String, default: "", maxlength: 40 },
    allergies: { type: [String], default: [] },
    notes: { type: String, default: "", maxlength: 2000 },
    photoUrl: { type: String, default: "" },
    avatarColor: { type: String, default: "" },
  },
  { timestamps: true },
);
export default (models.Pet as mongoose.Model<any>) || model("Pet", PetSchema);
