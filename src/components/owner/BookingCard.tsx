import Link from "next/link";
import { Calendar, Clock, Video, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

type Booking = {
  _id: string;
  vetName: string;
  petName: string;
  scheduledAt: string;
  mode: "video" | "chat";
  status: "upcoming" | "completed" | "cancelled";
};

export function BookingCard({ booking }: { booking: Booking }) {
  const dt = new Date(booking.scheduledAt);
  const statusTone = {
    upcoming: "bg-blue-50 text-blue-700",
    completed: "bg-emerald-50 text-emerald-700",
    cancelled: "bg-rose-50 text-rose-700",
  }[booking.status];

  return (
    <Link
      href={`/owner/bookings/${booking._id}`}
      className="block rounded-xl border border-blue-100 bg-white p-4 hover:border-blue-300 hover:shadow-md transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium text-slate-800">Dr. {booking.vetName}</p>
          <p className="text-sm text-slate-500">For {booking.petName}</p>
        </div>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full capitalize", statusTone)}>
          {booking.status}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
        <span className="flex items-center gap-1"><Calendar className="size-3.5" />{dt.toLocaleDateString()}</span>
        <span className="flex items-center gap-1"><Clock className="size-3.5" />{dt.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</span>
        <span className="flex items-center gap-1">
          {booking.mode === "video" ? <Video className="size-3.5" /> : <MessageSquare className="size-3.5" />}
          {booking.mode}
        </span>
      </div>
    </Link>
  );
}
