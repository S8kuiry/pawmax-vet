import { Schema, model, models, Types } from "mongoose";

const PaymentSchema = new Schema({
  bookingId: { type: Types.ObjectId, ref: "Booking", required: true, index: true },
  customerId:{ type: Types.ObjectId, ref: "User", required: true },
  vetId:     { type: Types.ObjectId, ref: "Vet" },

  gateway: { type: String, enum: ["razorpay"], default: "razorpay" },

  // Razorpay refs
  razorpayOrderId:    { type: String, index: true },
  razorpayPaymentId:  { type: String, index: true },
  razorpaySignature:  String,

  amount:    { type: Number, required: true },           // total paid (paise or rupees — pick one project-wide; recommend rupees)
  currency:  { type: String, default: "INR" },
  method:    String,                                      // card / upi / netbanking
  vpa: String, cardLast4: String, bank: String,

  // Route splits (linked account payout)
  transfers: [{
    razorpayTransferId: String,
    recipientAccountId: String,                           // acc_XXX
    amount: Number,
    onHoldUntil: Date,
    status: { type: String, enum: ["pending","processed","reversed","failed"] },
  }],

  // Refunds
  refunds: [{
    razorpayRefundId: String,
    amount: Number,
    reason: String,
    status: { type: String, enum: ["pending","processed","failed"] },
    createdAt: { type: Date, default: Date.now },
  }],

  status: {
    type: String,
    enum: ["created","authorized","captured","failed","refunded","partially_refunded"],
    default: "created",
    index: true,
  },

  webhookEvents: [{ event:String, payloadHash:String, receivedAt:Date }],
  errorCode: String, errorDescription: String,
}, { timestamps: true });

export default models.Payment || model("Payment", PaymentSchema);
