import { Schema, model, models, Types } from "mongoose";

const MessageSchema = new Schema({
  senderId: { type: Types.ObjectId, ref: "User", required: true },
  senderRole: { type: String, enum: ["owner","vet"], required: true },
  text: { type: String, required: true, maxlength: 2000 },
  at: { type: Date, default: Date.now },
}, { _id: true });

const ConsultationRoomSchema = new Schema({
  bookingId: { type: Types.ObjectId, ref: "Booking", required: true, unique: true, index: true },
  ownerId:   { type: Types.ObjectId, ref: "User", required: true },
  vetId:     { type: Types.ObjectId, ref: "User", required: true },
  mode:      { type: String, enum: ["video","chat","clinic"], required: true },
  dailyRoomUrl: { type: String },
  dailyRoomName:{ type: String },
  startedAt: { type: Date },
  endedAt:   { type: Date },
  messages:  [MessageSchema],
}, { timestamps: true });

export default models.ConsultationRoom || model("ConsultationRoom", ConsultationRoomSchema);
