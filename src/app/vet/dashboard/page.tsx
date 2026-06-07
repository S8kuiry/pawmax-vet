import Link from "next/link";
import { CalendarDays, DollarSign, PawPrint, Video } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Booking from "@/models/Booking";
import Pet from "@/models/Pet";
import Transaction from "@/models/Transaction";
import { formatInrFromCents } from "@/lib/booking-display";
import Vet from "@/models/Vet";

export default async function VetDashboardPage() {
  const session = await getSession();
  await dbConnect();
  const vetId = session!.id;
  const user = await Vet.findById(vetId).select("name").lean();

  const now = new Date();
  const dayStart = new Date(now);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(now);
  dayEnd.setHours(23, 59, 59, 999);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [todayCount, activeCount, petIds, monthAgg, todayBookings, upcomingCount] = await Promise.all([
    Booking.countDocuments({ vetId, startAt: { $gte: dayStart, $lte: dayEnd }, status: { $nin: ["cancelled", "declined"] } }),
    Booking.countDocuments({ vetId, status: "in_progress" }),
    Booking.distinct("petId", { vetId }),
    Transaction.aggregate([
      { $match: { vetId, kind: { $in: ["charge", "refund"] }, occurredAt: { $gte: monthStart } } },
      { $group: { _id: null, total: { $sum: "$netCents" } } },
    ]),
    Booking.find({ vetId, startAt: { $gte: dayStart, $lte: dayEnd }, status: { $nin: ["cancelled", "declined"] } })
      .sort({ startAt: 1 }).limit(8).lean(),
    Booking.countDocuments({ vetId, status: "confirmed", startAt: { $gte: now } }),
  ]);

  const monthPatients = await Pet.countDocuments({ _id: { $in: petIds }, createdAt: { $gte: monthStart } });
  const displayName = user?.name ? `Dr. ${user.name.split(" ")[0].charAt(0).toUpperCase() + user.name.split(" ")[0].slice(1,user.name.length-1).toLowerCase()}` : "Doctor";

  const stats = [
    { label: "Today's appointments", value: String(todayCount), icon: CalendarDays },
    { label: "Active consults", value: String(activeCount), icon: Video },
    { label: "New patients (mo)", value: String(monthPatients), icon: PawPrint },
    { label: "Earnings (mo)", value: formatInrFromCents(monthAgg[0]?.total), icon: DollarSign },
  ];

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Overview</p>
        <h1 className="text-3xl font-semibold">Good morning, {displayName}</h1>
        <p className="mt-2 text-slate-500">Here&apos;s what&apos;s happening across your practice today.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-500">{s.label}</span>
                <div className="size-9 rounded-lg bg-blue-50 grid place-items-center">
                  <Icon className="size-4 text-blue-600" />
                </div>
              </div>
              <p className="text-2xl font-semibold">{s.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-1">Upcoming today</h2>
          <p className="text-sm text-slate-500 mb-5">Confirmed appointments for today.</p>
          {todayBookings.length === 0 ? (
            <p className="text-sm text-slate-500">No appointments scheduled for today.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {todayBookings.map((b) => (
                <li key={String(b._id)} className="py-3 text-xs flex justify-between gap-4">
                  <span>
                    {new Date(b.startAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    {" — "}
                    {b.patientName} ({b.mode})
                    {b.reason ? ` · ${b.reason}` : ""}
                  </span>
                  <Link href={`/vet/bookings/${b._id}`} className="text-blue-600 shrink-0">View</Link>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-1">Upcoming bookings</h2>
          <p className="text-sm text-slate-500 mb-5">Confirmed appointments on your schedule.</p>
          {upcomingCount === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-200 rounded-xl text-sm text-slate-500">
              No upcoming bookings.
            </div>
          ) : (
            <div className="text-center py-10 border border-dashed border-blue-200 bg-blue-50 rounded-xl">
              <p className="text-2xl font-semibold text-blue-800">{upcomingCount}</p>
              <p className="text-sm text-blue-700 mt-1">confirmed booking{upcomingCount !== 1 ? "s" : ""}</p>
              <Link href="/vet/bookings" className="inline-block mt-3 text-sm text-blue-600 font-medium">View schedule →</Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
