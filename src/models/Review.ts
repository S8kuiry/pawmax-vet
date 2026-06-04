import { Schema, model, models, Types } from "mongoose";

const ReviewSchema = new Schema({
  bookingId:  { type: Types.ObjectId, ref: "Booking", required: true, unique: true },
  vetId:      { type: Types.ObjectId, ref: "Vet", required: true, index: true },
  customerId: { type: Types.ObjectId, ref: "User", required: true },
  petId:      { type: Types.ObjectId, ref: "Pet" },

  rating: { type: Number, min: 1, max: 5, required: true },
  ratings: {
    knowledge: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    punctuality: { type: Number, min: 1, max: 5 },
  },
  title: String,
  comment: String,

  vetReply: { text:String, repliedAt:Date },

  status: { type: String, enum: ["visible","hidden","flagged"], default: "visible" },
  isVerified: { type: Boolean, default: true },           // auto-true when tied to booking
}, { timestamps: true });

export default models.Review || model("Review", ReviewSchema);
