import Link from "next/link";
import { Plus } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Booking from "@/models/Booking";

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  confirmed: "bg-emerald-50 text-emerald-700",
  in_progress: "bg-blue-50 text-blue-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-slate-100 text-slate-500",
};

export default async function VetBookingsPage() {
  const session = await getSession();
  await dbConnect();
  const bookings = await Booking.find({ vetId: session!.id })
    .sort({ startAt: -1 })
    .limit(100)
    .lean();

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Workspace</p>
          <h1 className="text-3xl font-semibold">Bookings</h1>
          <p className="mt-2 text-slate-500">Incoming requests and confirmed appointments.</p>
        </div>
        <Link href="/vet/bookings/new" className="inline-flex items-center gap-2 rounded-lg bg-slate-900 text-white px-4 py-2 text-sm">
          <Plus className="size-4" /> New booking
        </Link>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        {bookings.length === 0 ? (
          <p className="p-8 text-sm text-slate-500 text-center">No bookings yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="text-left px-5 py-3">Pet</th>
                <th className="text-left px-5 py-3">Owner</th>
                <th className="text-left px-5 py-3">Type</th>
                <th className="text-left px-5 py-3">When</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <tr key={String(b._id)} className="hover:bg-slate-50">
                  <td className="px-5 py-4 font-medium">
                    <Link href={`/vet/bookings/${b._id}`} className="hover:text-blue-600">{b.patientName}</Link>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{b.ownerName}</td>
                  <td className="px-5 py-4 text-slate-600 capitalize">{b.mode}</td>
                  <td className="px-5 py-4 text-slate-600">
                    {new Date(b.startAt).toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_STYLE[b.status as string] || "bg-slate-100"}`}>
                      {b.status}
                    </span>
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
