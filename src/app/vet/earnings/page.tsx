import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Transaction from "@/models/Transaction";
import { formatInrFromCents } from "@/lib/booking-display";

export default async function VetEarningsPage() {
  const session = await getSession();
  await dbConnect();
  const vetId = session!.id;
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [monthAgg, pendingAgg, lifetimeAgg, transactions] = await Promise.all([
    Transaction.aggregate([
      { $match: { vetId, kind: { $in: ["charge", "refund"] }, occurredAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$netCents" } } },
    ]),
    Transaction.aggregate([
      { $match: { vetId, kind: { $in: ["charge", "refund"] }, status: { $in: ["pending", "available"] } } },
      { $group: { _id: null, total: { $sum: "$netCents" } } },
    ]),
    Transaction.aggregate([
      { $match: { vetId, kind: { $in: ["charge", "refund"] } } },
      { $group: { _id: null, total: { $sum: "$netCents" } } },
    ]),
    Transaction.find({ vetId }).sort({ occurredAt: -1 }).limit(30).lean(),
  ]);

  const stats = [
    { label: "This month", value: formatInrFromCents(monthAgg[0]?.total) },
    { label: "Pending payout", value: formatInrFromCents(pendingAgg[0]?.total) },
    { label: "Lifetime", value: formatInrFromCents(lifetimeAgg[0]?.total) },
  ];

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Finance</p>
        <h1 className="text-3xl font-semibold">Earnings</h1>
        <p className="mt-2 text-slate-500">Monthly summary, pending payouts and transactions.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl bg-white border border-slate-200 p-5">
            <p className="text-sm text-slate-500">{s.label}</p>
            <p className="text-2xl font-semibold mt-2">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        {transactions.length === 0 ? (
          <p className="p-8 text-sm text-slate-500 text-center">No transactions yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Kind</th>
                <th className="text-left px-5 py-3">Status</th>
                <th className="text-right px-5 py-3">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {transactions.map((t) => (
                <tr key={String(t._id)}>
                  <td className="px-5 py-4 text-slate-600">
                    {new Date(t.occurredAt as Date).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-4 capitalize">{t.kind as string}</td>
                  <td className="px-5 py-4 capitalize">{t.status as string}</td>
                  <td className="px-5 py-4 text-right font-medium">
                    {formatInrFromCents(t.netCents as number)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
