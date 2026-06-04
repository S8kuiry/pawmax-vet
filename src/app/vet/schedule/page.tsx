import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Booking from "@/models/Booking";

export default async function VetSchedulePage() {
  const session = await getSession();
  await dbConnect();
  const from = new Date();
  const to = new Date(from.getTime() + 7 * 24 * 60 * 60 * 1000);
  const items = await Booking.find({
    vetId: session!.id,
    status: { $in: ["pending", "confirmed", "in_progress"] },
    startAt: { $gte: from, $lte: to },
  }).sort({ startAt: 1 }).lean();

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Workspace</p>
        <h1 className="text-3xl font-semibold">Schedule</h1>
        <p className="mt-2 text-slate-500">Next 7 days of confirmed and pending appointments.</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">Nothing on the calendar this week.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((b) => (
            <li key={String(b._id)} className="rounded-2xl bg-white border border-slate-200 p-5 flex justify-between items-center gap-4">
              <div>
                <p className="font-medium">{b.patientName} · {b.ownerName}</p>
                <p className="text-sm text-slate-500">
                  {new Date(b.startAt).toLocaleString()} · {b.mode} · <span className="capitalize">{b.status}</span>
                </p>
                {b.reason && <p className="text-sm text-slate-600 mt-1">{b.reason}</p>}
              </div>
              <Link href={`/vet/bookings/${b._id}`} className="text-sm text-blue-600 shrink-0">Open</Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
