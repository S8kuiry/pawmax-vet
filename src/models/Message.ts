import mongoose, { Schema, model, models, Types } from "mongoose";

/**
 * Message
 * -----------------------------------------------------------
 * A single chat message exchanged between a pet parent (owner)
 * and a vet, scoped to a specific Booking (the consultation
 * thread).
 *
 * Design notes:
 * - Every message belongs to ONE booking → that's the "thread".
 * - `sender` + `senderRole` lets us render bubbles + authorize
 *   without an extra populate.
 * - `readBy` is an array of userIds → supports unread counts
 *   for either side without a separate table.
 * - `attachments` covers images / lab reports / prescriptions
 *   shared in chat. Empty array by default.
 * - `system` messages (e.g. "Consultation started",
 *   "Prescription added") are rendered differently in the UI.
 * - `deletedAt` is a soft-delete so we never lose audit trail.
 */

export type SenderRole = "owner" | "vet" | "system";
export type MessageKind = "text" | "image" | "file" | "system";

export interface IAttachment {
  url: string;
  name?: string;
  mimeType?: string;
  size?: number; // bytes
}

export interface IMessage {
  _id: Types.ObjectId;
  booking: Types.ObjectId;          // thread id
  sender: Types.ObjectId;           // User._id (null for system)
  senderRole: SenderRole;
  kind: MessageKind;
  text?: string;                    // required unless kind === "file"/"image" only
  attachments: IAttachment[];
  readBy: Types.ObjectId[];         // userIds who have read it
  deliveredAt?: Date;
  editedAt?: Date;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IAttachment>(
  {
    url: { type: String, required: true },
    name: { type: String },
    mimeType: { type: String },
    size: { type: Number, min: 0 },
  },
  { _id: false },
);

const MessageSchema = new Schema<IMessage>(
  {
    booking: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      index: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: function (this: IMessage) {
        return this.senderRole !== "system";
      },
    },
    senderRole: {
      type: String,
      enum: ["owner", "vet", "system"],
      required: true,
    },
    kind: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
      required: true,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 4000,
    },
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    readBy: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
      index: true,
    },
    deliveredAt: { type: Date },
    editedAt: { type: Date },
    deletedAt: { type: Date },
  },
  { timestamps: true },
);

// Must have either text or at least one attachment (except system messages)
// Must have either text or at least one attachment (except system messages)
MessageSchema.pre("validate", function (this: IMessage) {
    if (this.senderRole === "system") return;
  
    const hasText = !!(this.text && this.text.trim().length);
    const hasAttachment = (this.attachments?.length ?? 0) > 0;
  
    if (!hasText && !hasAttachment) {
      throw new Error("Message must contain text or at least one attachment.");
    }
  });

// Fast lookup: latest message per thread, unread counts.
MessageSchema.index({ booking: 1, createdAt: -1 });
MessageSchema.index({ booking: 1, readBy: 1 });

const Message =
  (models.Message as mongoose.Model<IMessage>) ||
  model<IMessage>("Message", MessageSchema);

export default Message;
