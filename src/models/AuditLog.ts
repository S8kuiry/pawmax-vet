import { Schema, model, models, Types } from "mongoose";

const AuditLogSchema = new Schema({
  actorId:   { type: Types.ObjectId, ref: "User" },       // null for system
  actorRole: { type: String, enum: ["customer","vet","admin","system","webhook"] },

  action: { type: String, required: true, index: true },  // "booking.cancel", "payment.refund", "vet.kyc.approve"
  entityType: { type: String, required: true },           // "Booking", "Payment", ...
  entityId:   { type: Types.ObjectId, required: true, index: true },

  before: Schema.Types.Mixed,
  after:  Schema.Types.Mixed,
  diff:   Schema.Types.Mixed,

  ip: String,
  userAgent: String,
  source: { type: String, enum: ["web","admin","mobile","webhook","cron"], default: "web" },

  notes: String,
}, { timestamps: { createdAt: true, updatedAt: false } });

AuditLogSchema.index({ entityType:1, entityId:1, createdAt:-1 });

export default models.AuditLog || model("AuditLog", AuditLogSchema);
