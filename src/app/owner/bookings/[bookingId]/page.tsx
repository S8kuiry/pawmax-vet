import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Booking from "@/models/Booking";
import { getSession } from "@/lib/auth";
import { enrichBookingsForOwner } from "@/lib/booking-display";
import { ArrowLeft, Video, MessageSquare, X } from "lucide-react";

export default async function BookingDetail({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const session = await getSession();
  await dbConnect();
  const raw = await Booking.findOne({ _id: bookingId, ownerId: session!.id }).lean();
  if (!raw) notFound();

  const [b] = await enrichBookingsForOwner([raw as Record<string, unknown>]);
  const upcoming = new Date(b.date) > new Date() && !["cancelled", "declined", "completed"].includes(b.status as string);

  return (
    <div className="max-w-3xl">
      <Link href="/owner/bookings" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="size-4" /> Back to bookings
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-slate-500">Booking ID · {String(b._id).slice(-6)}</p>
            <h1 className="text-2xl font-bold mt-1">{b.petName} with {b.vetName}</h1>
            <p className="text-slate-600 mt-1">{b.reason}</p>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">{b.status}</span>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-500">Date & time</dt><dd className="font-medium">{new Date(b.date).toLocaleString()}</dd></div>
          <div><dt className="text-slate-500">Duration</dt><dd className="font-medium">{b.durationMin} min</dd></div>
          <div><dt className="text-slate-500">Mode</dt><dd className="font-medium capitalize">{b.mode || "video"}</dd></div>
          <div><dt className="text-slate-500">Fee</dt><dd className="font-medium">{b.fee != null ? `₹${b.fee}` : "—"}</dd></div>
        </dl>

        {upcoming && (
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link href={`/owner/consultations/${b._id}`} className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              <Video className="size-4" /> Join consultation
            </Link>
            <Link href={`/owner/consultations/${b._id}`} className="inline-flex items-center gap-2 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50">
              <MessageSquare className="size-4" /> Message vet
            </Link>
            <form action={`/api/bookings/${b._id}/cancel`} method="POST">
              <button className="inline-flex items-center gap-2 text-red-600 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50">
                <X className="size-4" /> Cancel
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
