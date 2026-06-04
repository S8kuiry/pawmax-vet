import { Schema, model, models, Types } from "mongoose";

const NotificationSchema = new Schema({
  userId: { type: Types.ObjectId, ref: "User", required: true, index: true },
  audience: { type: String, enum: ["customer","vet","admin"], default: "customer" },

  channel: { type: String, enum: ["inapp","email","sms","whatsapp","push"], required: true },
  type: { type: String, required: true },                 // booking.confirmed, rx.issued, reminder.1h ...

  title: String,
  body: String,
  data: Schema.Types.Mixed,                               // { bookingId, deepLink, ... }

  // Channel-specific
  provider: { type: String, enum: ["brevo","mtalkz","interakt","fcm","inapp"] },
  providerMessageId: String,
  templateId: String,

  status: { type: String, enum: ["queued","sent","delivered","read","failed"], default: "queued", index: true },
  sentAt: Date, deliveredAt: Date, readAt: Date,
  error: String, retryCount: { type: Number, default: 0 },
}, { timestamps: true });

NotificationSchema.index({ userId:1, createdAt:-1 });

export default models.Notification || model("Notification", NotificationSchema);
