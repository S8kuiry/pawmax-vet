import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Consultation from "@/models/Consultation";
import Booking from "@/models/Booking";

export default async function VetConsultationsPage() {
  const session = await getSession();
  await dbConnect();
  const consultations = await Consultation.find({ vetId: session!.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const bookingIds = consultations.map((c) => c.bookingId).filter(Boolean);
  const bookings = await Booking.find({ _id: { $in: bookingIds } }).lean();
  const bookingMap = Object.fromEntries(bookings.map((b) => [String(b._id), b]));

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Workspace</p>
        <h1 className="text-3xl font-semibold">Consultations</h1>
        <p className="mt-2 text-slate-500">Video and in-clinic sessions.</p>
      </div>

      {consultations.length === 0 ? (
        <p className="text-sm text-slate-500">No consultations yet. They appear when you start a booked session.</p>
      ) : (
        <ul className="space-y-3">
          {consultations.map((c) => {
            const b = bookingMap[String(c.bookingId)];
            return (
              <li key={String(c._id)} className="rounded-2xl bg-white border border-slate-200 p-5 flex justify-between items-center">
                <div>
                  <p className="font-medium">{b?.patientName || "Consultation"}</p>
                  <p className="text-sm text-slate-500 capitalize">{c.status as string} · {c.mode as string}</p>
                </div>
                <Link href={`/vet/consultations/${c._id}`} className="text-sm text-blue-600">Open →</Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
