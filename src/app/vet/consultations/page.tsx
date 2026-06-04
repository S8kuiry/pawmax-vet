import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Booking from "@/models/Booking";
import { Video } from "lucide-react";

export default async function VetConsultationsPage() {
  const session = await getSession();
  await dbConnect();

  const bookings = await Booking.find({
    vetId: session!.id,
    mode: "video",
    status: { $in: ["confirmed", "in_progress", "pending"] },
    startAt: { $gte: new Date(Date.now() - 2 * 3600 * 1000) },
  })
    .sort({ startAt: 1 })
    .lean();

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">
          Workspace
        </p>
        <h1 className="text-3xl font-semibold">Consultations</h1>
        <p className="mt-2 text-slate-500">Live and upcoming video sessions.</p>
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-slate-500">
          No active video consultations. Confirmed video bookings appear here when it is time to join.
        </p>
      ) : (
        <ul className="space-y-3">
          {bookings.map((b) => {
            const live = new Date(b.startAt) <= new Date();
            return (
              <li
                key={String(b._id)}
                className="rounded-2xl bg-white border border-slate-200 p-5 flex justify-between items-center"
              >
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-blue-50 grid place-items-center">
                    <Video className="size-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{b.patientName || "Consultation"}</p>
                      {live && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">
                          ● LIVE
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 capitalize">
                      {b.status as string} · {new Date(b.startAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/consult/${b._id}`}
                  className="text-sm font-medium text-blue-600 hover:underline"
                >
                  {live ? "Join →" : "Open →"}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
