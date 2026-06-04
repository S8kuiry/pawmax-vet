import mongoose, { Schema, models, model } from "mongoose";
const ThreadSchema = new Schema(
  {
    vetId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    petId: { type: Schema.Types.ObjectId, ref: "Pet" },
    lastMessage: { type: String, default: "" },
    lastMessageAt: { type: Date, default: Date.now, index: true },
    unreadForVet: { type: Number, default: 0 },
    unreadForOwner: { type: Number, default: 0 },
  },
  { timestamps: true },
);
ThreadSchema.index({ vetId: 1, ownerId: 1, petId: 1 }, { unique: true });
export default (models.Thread as mongoose.Model<any>) ||
  model("Thread", ThreadSchema);