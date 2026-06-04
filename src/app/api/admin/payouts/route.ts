import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Booking from "@/models/Booking";
import Payout from "@/models/Payout";

const Body = z.object({
  vetId: z.string(),
  periodStart: z.string().datetime(),
  periodEnd: z.string().datetime(),
  platformFeePct: z.number().min(0).max(50).default(15),
  gstPct: z.number().min(0).max(28).default(18),
});

export async function GET() {
  await requireRole("admin");
  await dbConnect();
  const payouts = await Payout.find().sort({ createdAt: -1 }).populate("vetId","name email").lean();
  return NextResponse.json({ payouts });
}

export async function POST(req: NextRequest) {
  await requireRole("admin");
  const b = Body.parse(await req.json());
  await dbConnect();
  const bookings = await Booking.find({
    vetId: b.vetId, status: "completed", paid: true, payoutId: { $exists: false },
    date: { $gte: new Date(b.periodStart), $lte: new Date(b.periodEnd) },
  });
  const gross = bookings.reduce((s, x: any) => s + (x.amount || 0), 0);
  const fee = +(gross * b.platformFeePct / 100).toFixed(2);
  const gst = +((gross - fee) * b.gstPct / 100).toFixed(2);
  const net = +(gross - fee - gst).toFixed(2);

  const payout = await Payout.create({
    vetId: b.vetId, periodStart: b.periodStart, periodEnd: b.periodEnd,
    bookingIds: bookings.map(x => x._id),
    grossAmount: gross, platformFee: fee, gst, netAmount: net, status: "pending",
  });
  await Booking.updateMany({ _id: { $in: bookings.map(x => x._id) } }, { payoutId: payout._id });
  return NextResponse.json({ payout }, { status: 201 });
}
