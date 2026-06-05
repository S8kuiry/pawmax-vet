import mongoose from "mongoose";

const SlotSchema = new mongoose.Schema(
  {
    vetId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Vet", 
      required: true 
    },
    startTime: { 
      type: Date, 
      required: true 
    },
    endTime: { 
      type: Date, 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["available", "booked"], 
      default: "available" 
    },
    bookingId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Booking", 
      default: null 
    },
  },
  { timestamps: true }
);

// ⚡ High-performance compound index for rapid calendar lookups
SlotSchema.index({ vetId: 1, startTime: 1, status: 1 });

export default mongoose.models.Slot || mongoose.model("Slot", SlotSchema);