import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Transaction from "@/models/Transaction";
export async function GET(req: Request) {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);
  await dbConnect();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const [monthAgg, pendingAgg, lifetimeAgg, transactions] = await Promise.all([
    Transaction.aggregate([
      {
        $match: {
          vetId: guard.session.id,
          kind: { $in: ["charge", "refund"] },
          occurredAt: { $gte: monthStart },
        },
      },
      { $group: { _id: null, total: { $sum: "$netCents" } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          vetId: guard.session.id,
          kind: { $in: ["charge", "refund"] },
          status: { $in: ["pending", "available"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$netCents" } } },
    ]),
    Transaction.aggregate([
      {
        $match: {
          vetId: guard.session.id,
          kind: { $in: ["charge", "refund"] },
        },
      },
      { $group: { _id: null, total: { $sum: "$netCents" } } },
    ]),
    Transaction.find({ vetId: guard.session.id })
      .sort({ occurredAt: -1 })
      .limit(limit)
      .lean(),
  ]);
  return NextResponse.json({
    stats: {
      monthCents: monthAgg[0]?.total ?? 0,
      pendingCents: pendingAgg[0]?.total ?? 0,
      lifetimeCents: lifetimeAgg[0]?.total ?? 0,
      currency: "USD",
    },
    transactions,
  });
}
