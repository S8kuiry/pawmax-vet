import { Schema, model, models, Types } from "mongoose";

const PetSchema = new Schema({
  ownerId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  species: { type: String, enum: ["Dog","Cat","Rabbit","Bird","Reptile","Other"], required: true },
  breed: { type: String, trim: true, maxlength: 80 },
  sex: { type: String, enum: ["male","female","unknown"], default: "unknown" },
  dob: { type: Date },
  weightKg: { type: Number, min: 0, max: 200 },
  color: { type: String, maxlength: 40 },
  photoUrl: { type: String },
  notes: { type: String, maxlength: 2000 },
}, { timestamps: true });

export default models.Pet || model("Pet", PetSchema);
