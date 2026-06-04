import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Booking from "@/models/Booking";
import { getSession } from "@/lib/auth";
import { enrichBookingsForOwner } from "@/lib/booking-display";
import { CalendarDays, Clock } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-blue-100 text-blue-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  cancelled: "bg-slate-100 text-slate-500",
  declined: "bg-slate-100 text-slate-500",
};

export default async function BookingsPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab = "upcoming" } = await searchParams;
  const session = await getSession();
  await dbConnect();

  const now = new Date();
  const query: Record<string, unknown> = { ownerId: session!.id };
  if (tab === "upcoming") {
    query.startAt = { $gte: now };
    query.status = { $nin: ["cancelled", "declined", "completed"] };
  } else if (tab === "past") {
    query.status = "completed";
  } else if (tab === "cancelled") {
    query.status = { $in: ["cancelled", "declined"] };
  }

  const raw = await Booking.find(query).sort({ startAt: tab === "past" ? -1 : 1 }).lean();
  const bookings = await enrichBookingsForOwner(raw as Record<string, unknown>[]);

  const tabs = [
    { id: "upcoming", label: "Upcoming" },
    { id: "past", label: "Past" },
    { id: "cancelled", label: "Cancelled" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-blue-700">My Bookings</h1>
        <Link href="/owner/vets" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Book a vet</Link>
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-6">
        {tabs.map((t) => (
          <Link key={t.id} href={`/owner/bookings?tab=${t.id}`}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${tab === t.id ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </Link>
        ))}
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-16 bg-white border border-dashed rounded-xl">
          <CalendarDays className="size-10 mx-auto text-slate-300" />
          <p className="mt-3 text-slate-500">No bookings in this list</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => (
            <Link key={String(b._id)} href={`/owner/bookings/${b._id}`}
              className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-blue-50 grid place-items-center"><Clock className="size-5 text-blue-600" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{b.petName}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[b.status as string] || "bg-slate-100 text-slate-600"}`}>{b.status}</span>
                  </div>
                  <p className="text-sm text-slate-500">{b.reason} · with {b.vetName}</p>
                  <p className="text-xs text-slate-400 mt-1">{new Date(b.date).toLocaleString()}</p>
                </div>
              </div>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
}
