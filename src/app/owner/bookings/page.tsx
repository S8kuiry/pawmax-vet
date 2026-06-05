import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Booking from "@/models/Booking";
import { getSession } from "@/lib/auth";
import { enrichBookingsForOwner } from "@/lib/booking-display";
import { CalendarDays, Clock, PawPrint, User, ArrowUpRight, Plus, Activity, AlertCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-50 border border-amber-200/60 text-amber-700",
  confirmed: "bg-blue-50 border border-blue-200/60 text-blue-700",
  in_progress: "bg-blue-50 border border-blue-200/60 text-blue-700",
  completed: "bg-emerald-50 border border-emerald-200/60 text-emerald-700",
  cancelled: "bg-slate-100 border border-slate-200 text-slate-500",
  declined: "bg-rose-50 border border-rose-200/60 text-rose-600",
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
    { id: "upcoming", label: "Upcoming Sessions" },
    { id: "past", label: "Archived History" },
    { id: "cancelled", label: "Cancelled Log" },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-800 max-w-[1500px] mx-auto py-8 px-6 lg:px-10 space-y-8 antialiased">
      
      {/* Premium Core Top Bar */}
      <div className="border-b border-slate-100 pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block mb-1">Client Terminal</span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Medical Appointments</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Monitor patient diagnostic timelines, manage scheduled checkups, and verify appointment lifecycle updates.
          </p>
        </div>

        <div>
          <Link 
            href="/owner/vets" 
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 text-xs font-medium transition shadow-sm"
          >
            <Plus className="size-3.5" /> Book Medical Consultation
          </Link>
        </div>
      </div>

      {/* Segmented Low-Profile Navigation Tabs */}
      <div className="flex gap-2 border-b border-slate-100 pb-px">
        {tabs.map((t) => {
          const isActive = tab === t.id;
          return (
            <Link 
              key={t.id} 
              href={`/owner/bookings?tab=${t.id}`}
              className={`px-3 py-2 text-xs font-semibold tracking-tight transition-all relative -mb-px border-b-2 ${
                isActive 
                  ? "border-blue-600 text-blue-600" 
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </div>

      {/* Structured Content Deployment */}
      {bookings.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl p-16 text-center bg-slate-50/20 max-w-lg mx-auto">
          <CalendarDays className="size-5 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No records found</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5 leading-relaxed">
            There are currently no active appointments matching this filter status tier.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {bookings.map((b, idx) => {
            const formattedTime = new Date(b.date).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false
            });

            return (
              <Link 
                key={String(b._id)} 
                href={`/owner/bookings/${b._id}`}
                className="group block bg-white border border-slate-200/70 rounded-xl p-3.5 hover:border-slate-300 hover:bg-slate-50/40 transition shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  
                  {/* Left Side: Patient and Medical Personnel Cluster */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    <div className="size-9 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-blue-500 group-hover:border-blue-100 transition-colors">
                      <PawPrint className="size-4 shrink-0" />
                    </div>
                    
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-xs font-bold text-slate-900 tracking-tight">{b.petName}</p>
                        <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${STATUS_COLORS[b.status as string] || "bg-slate-100 text-slate-600"}`}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate">
                        {b.reason} <span className="text-slate-300 mx-1">|</span> <span className="text-slate-600 inline-flex items-center gap-1"><User className="size-3 text-slate-400" /> Clinic: {b.vetName}</span>
                      </p>
                    </div>
                  </div>

                  {/* Right Side: Timeline Vectors & Call to Action */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-t-0 border-slate-100 pt-2.5 sm:pt-0 shrink-0">
                    <div className="flex items-center gap-2 text-right">
                      <Clock className="size-3.5 text-slate-400" />
                      <div className="text-left sm:text-right">
                        <p className="text-[11px] font-bold text-slate-700 tracking-tight">{formattedTime}</p>
                        <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">Scheduled Window</p>
                      </div>
                    </div>

                    <div className="size-7 rounded border border-slate-200 bg-white flex items-center justify-center text-slate-400 group-hover:text-blue-600 group-hover:border-blue-200 transition shadow-3xs">
                      <ArrowUpRight className="size-3.5" />
                    </div>
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}