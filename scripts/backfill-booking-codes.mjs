/**
 * One-time fix: assign bookingCode to any bookings that have null/missing bookingCode.
 * Run: node scripts/backfill-booking-codes.mjs
 */
import mongoose from "mongoose";

function generateBookingCode() {
  const ts = Date.now().toString(36).toUpperCase();
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `PMX-${ts}-${rnd}`;
}

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Set MONGODB_URI in your environment (e.g. from .env.local)");
  process.exit(1);
}

await mongoose.connect(uri);

const col = mongoose.connection.collection("bookings");
const cursor = col.find({
  $or: [{ bookingCode: null }, { bookingCode: { $exists: false } }],
});

let updated = 0;
for await (const doc of cursor) {
  await col.updateOne({ _id: doc._id }, { $set: { bookingCode: generateBookingCode() } });
  updated++;
  // stagger codes so rapid loop doesn't collide
  await new Promise((r) => setTimeout(r, 2));
}

console.log(`Backfilled bookingCode on ${updated} booking(s).`);
await mongoose.disconnect();
