import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Booking from "@/models/Booking";
import { getSession } from "@/lib/auth";
import { enrichBookingsForOwner } from "@/lib/booking-display";
import { ArrowLeft, Video, MessageSquare, X, ShieldAlert, Calendar, Clock, Laptop, IndianRupee } from "lucide-react";

// Luminous Dark-Theme Status Badges
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-500/10 border border-amber-500/20 text-amber-400",
  confirmed: "bg-blue-500/10 border border-blue-500/20 text-blue-400",
  in_progress: "bg-indigo-500/10 border border-indigo-500/20 text-indigo-400",
  completed: "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400",
  cancelled: "bg-slate-800/60 border border-slate-700/50 text-slate-400",
  declined: "bg-rose-500/10 border border-rose-500/20 text-rose-400",
};

export default async function BookingDetail({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const session = await getSession();
  await dbConnect();
  
  const raw = await Booking.findOne({ _id: bookingId, ownerId: session!.id }).lean();
  if (!raw) notFound();

  const [b] = await enrichBookingsForOwner([raw as Record<string, unknown>]);
  const canJoin =
    b.mode === "video" &&
    ["confirmed", "in_progress", "pending"].includes(b.status as string);

  return (
    /* Full-Bleed Fluid Layout Frame */
    <div className="min-h-screen bg-[#FFFFFF] text-slate-200 w-full ">
      
      {/* Dynamic Back-Navigation Anchor */}
      <div className="max-w-4xl mb-4">
        <Link 
          href="/owner/bookings" 
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors group"
        >
          <ArrowLeft className="size-3.5 group-hover:-translate-x-0.5 transition-transform" /> Back to appointments terminal
        </Link>
      </div>

      {/* Main Details Presentation Sheet */}
      <div className="max-w-6xl bg-[#0f172a] border border-blue-950/70 rounded-2xl p-6 md:p-8 shadow-xl space-y-8">
        
        {/* Top Header Split Area */}
        <div className="border-b border-slate-800/60 pb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                Ref Code · {String(b._id).slice(-6).toUpperCase()}
              </span>
            </div>
            
            <h1 className="text-xl font-black text-white tracking-tight pt-1">
              {b.petName} <span className="font-normal text-slate-400 text-base mx-1">with</span> Dr. {b.vetName}
            </h1>
            
            <p className="text-xs text-slate-400 font-medium max-w-2xl leading-relaxed">
              Reason for Visit: <span className="text-slate-200">{b.reason}</span>
            </p>
          </div>

          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded border uppercase tracking-wider shrink-0 w-fit ${STATUS_COLORS[b.status as string] || "bg-slate-800 text-slate-400"}`}>
            {b.status}
          </span>
        </div>

        {/* Structural Diagnostic Grid Details */}
        <div>
          <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">
            Appointment Verification Metrics
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-[#141d33]/50 border border-slate-800/80 rounded-xl p-4">
            {/* Metric Item: Date */}
            <div className="space-y-1">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="size-3 text-slate-500" /> Date & Time
              </span>
              <p className="text-xs font-bold text-white tracking-tight">
                {new Date(b.date).toLocaleString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false
                })}
              </p>
            </div>

            {/* Metric Item: Duration */}
            <div className="space-y-1">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="size-3 text-slate-500" /> Duration Block
              </span>
              <p className="text-xs font-bold text-white tracking-tight">
                {b.durationMin} Minutes
              </p>
            </div>

            {/* Metric Item: Mode */}
            <div className="space-y-1">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Laptop className="size-3 text-slate-500" /> Channel Vector
              </span>
              <p className="text-xs font-bold text-blue-400 tracking-tight capitalize">
                {b.mode || "video"} Streaming
              </p>
            </div>

            {/* Metric Item: Fee */}
            <div className="space-y-1">
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <IndianRupee className="size-3 text-slate-500" /> Consultation Fee
              </span>
              <p className="text-xs font-bold text-emerald-400 tracking-tight">
                {b.fee != null ? `₹${b.fee}` : "—"}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls & Operational Gateways */}
        {canJoin && (
          <div className="border-t border-slate-800/60 pt-6 flex flex-wrap items-center justify-between gap-4">
            
            {/* Primary Telehealth Interfacing Links */}
            <div className="flex flex-wrap items-center gap-3">
              <Link 
                href={`/consult/${b._id}`} 
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition shadow-md"
              >
                <Video className="size-4" /> Start Telehealth Session
              </Link>
              
              <Link 
                href={`/owner/consultations/${b._id}`} 
                className="inline-flex items-center gap-2 border border-slate-700 bg-[#161f30] text-slate-200 hover:bg-[#1e2a42] text-xs font-medium px-4 py-2 rounded-lg transition"
              >
                <MessageSquare className="size-4 text-blue-400" /> Open Realtime Chat
              </Link>
            </div>

            {/* Destructive Administrative Form Block */}
            <form action={`/api/bookings/${b._id}/cancel`} method="POST" className="w-full sm:w-auto">
              <button 
                type="submit" 
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 text-rose-400 border border-rose-950/60 bg-rose-950/10 hover:bg-rose-950/30 hover:border-rose-500/40 text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                <X className="size-4" /> Request Cancellation
              </button>
            </form>

          </div>
        )}

      </div>
    </div>
  );
}