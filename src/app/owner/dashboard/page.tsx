import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Pet from "@/models/Pet";
import Prescription from "@/models/Prescription";
import { getSession } from "@/lib/auth";
import { enrichBookingsForOwner } from "@/lib/booking-display";
import { PawPrint, CalendarDays, Stethoscope, FileText, Plus, ArrowRight, Clock, CheckCircle2 } from "lucide-react";
import Booking from "@/models/Booking";

export default async function OwnerDashboard() {
  const session = await getSession();
  await dbConnect();

  const now = new Date();
  const [pets, upcomingRaw, recentRaw, rxCount] = await Promise.all([
    Pet.find({ ownerId: session!.id }).lean(),
    Booking.find({
      ownerId: session!.id,
      startAt: { $gte: now },
      status: { $nin: ["cancelled", "declined"] },
    }).sort({ startAt: 1 }).limit(5).lean(),
    Booking.find({ ownerId: session!.id, status: "completed" }).sort({ startAt: -1 }).limit(3).lean(),
    Prescription.countDocuments({ ownerId: session!.id, status: "active" }),
  ]);

  const [upcoming, recent] = await Promise.all([
    enrichBookingsForOwner(upcomingRaw as Record<string, unknown>[]),
    enrichBookingsForOwner(recentRaw as Record<string, unknown>[]),
  ]);

  const stats = [
    { label: "My Pets", value: pets.length, icon: PawPrint, href: "/owner/pets" },
    { label: "Upcoming", value: upcoming.length, icon: CalendarDays, href: "/owner/bookings" },
    { label: "Completed", value: recent.length, icon: CheckCircle2, href: "/owner/bookings?tab=past" },
    { label: "Prescriptions", value: rxCount, icon: FileText, href: "/owner/prescriptions" },
  ];

  return (
    <div className="space-y-8">
      <section className="rounded-2xl bg-gradient-to-r from-[#0E1525] to-blue-500 text-white p-8">
        <p className="text-blue-100 text-sm">Welcome back</p>
        <h1 className="text-3xl font-bold tracking-wider mt-1">Hi {session!.email.split("@")[0].charAt(0).toUpperCase() + session!.email.split("@")[0].slice(1,session!.email.split("@")[0].length).toLowerCase()} 👋</h1>
        <p className="mt-2 text-sm text-blue-50">Manage your Pets, book Vets, track Health Records — all in one place.</p>
        <div className="mt-6 flex gap-3 flex-wrap">
          <Link href="/owner/vets" className="bg-white text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-50">Book a vet</Link>
          <Link href="/owner/pets/new" className="bg-white text-blue-700 border border-white/30 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 ">+ Add pet</Link>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="rounded-xl bg-white border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{label}</p>
              <div className="size-9 rounded-lg bg-blue-50 grid place-items-center"><Icon className="size-4 text-blue-600" /></div>
            </div>
            <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
          </Link>
        ))}
      </section>

      <section className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-6">
          <header className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Upcoming appointments</h3>
            <Link href="/owner/bookings" className="text-sm text-blue-600 hover:underline">View all</Link>
          </header>
          {upcoming.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <p className="text-slate-500">No upcoming appointments</p>
              <Link href="/owner/vets" className="inline-block mt-3 text-blue-600 font-medium hover:underline">Book a vet →</Link>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {upcoming.map((b) => (
                <li key={String(b._id)} className="py-3 flex items-center gap-4">
                  <div className="size-10 rounded-lg bg-blue-50 grid place-items-center"><Clock className="size-4 text-blue-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{b.petName} · {b.reason}</p>
                    <p className="text-sm text-slate-500">{new Date(b.date).toLocaleString()} · {b.vetName}</p>
                  </div>
                  <Link href={`/owner/bookings/${b._id}`} className="text-sm text-blue-600 hover:underline">Details</Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-6">
          <header className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">My pets</h3>
            <Link href="/owner/pets" className="text-sm text-blue-600 hover:underline">Manage</Link>
          </header>
          {pets.length === 0 ? (
            <div className="text-center py-10 border border-dashed rounded-lg">
              <PawPrint className="size-6 mx-auto text-slate-300" />
              <Link href="/owner/pets/new" className="inline-block mt-3 text-blue-600 font-medium hover:underline">Add a pet →</Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {pets.slice(0, 5).map((p: Record<string, unknown>) => (
                <Link key={String(p._id)} href={`/owner/pets/${p._id}`} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-slate-50">
                  <div className="size-9 rounded-lg bg-blue-50 grid place-items-center"><PawPrint className="size-4 text-blue-600" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{p.name as string}</p>
                    <p className="text-xs text-slate-500">{p.species as string} · {(p.breed as string) || "—"}</p>
                  </div>
                  <ArrowRight className="size-4 text-slate-400" />
                </Link>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
