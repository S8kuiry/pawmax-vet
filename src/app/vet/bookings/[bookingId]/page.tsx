import { notFound } from "next/navigation";
import Link from "next/link";
import { Video } from "lucide-react";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Booking from "@/models/Booking";
export default async function VetBookingDetail({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const session = await getSession();
  await dbConnect();
  const b = await Booking.findOne({ _id: bookingId, vetId: session!.id }).lean();
  if (!b) notFound();

  return (
    <div className="px-10 py-10 max-w-3xl mx-auto">
      <Link href="/vet/bookings" className="text-sm text-slate-500 hover:text-blue-600">← Back to bookings</Link>
      <h1 className="text-3xl font-semibold mt-4">{b.patientName} · {b.ownerName}</h1>
      <p className="text-slate-500 mt-1 capitalize">{b.status} · {b.mode}</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 text-sm bg-white border border-slate-200 rounded-2xl p-6">
        <div><dt className="text-slate-500">When</dt><dd className="font-medium">{new Date(b.startAt).toLocaleString()}</dd></div>
        <div><dt className="text-slate-500">Reason</dt><dd className="font-medium">{b.reason || "—"}</dd></div>
        <div><dt className="text-slate-500">Notes</dt><dd className="font-medium">{b.notes || "—"}</dd></div>
      </dl>

      {b.petId && (
        <Link href={`/vet/patients/${b.petId}`} className="inline-block mt-6 text-blue-600 font-medium">
          View patient →
        </Link>
      )}

      {b.mode === "video" && ["confirmed", "in_progress"].includes(b.status as string) && (
        <Link
          href={`/consult/${b._id}`}
          className="inline-flex items-center gap-2 mt-6 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Video className="size-4" /> Join video consultation
        </Link>
      )}
    </div>
  );
}
