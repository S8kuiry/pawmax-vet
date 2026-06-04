import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Booking from "@/models/Booking";
import { getSession } from "@/lib/auth";
import { Video } from "lucide-react";

export default async function ConsultationsPage() {
  const session = await getSession();
  await dbConnect();
  const sessions = await Booking.find({
    ownerId: session!.id,
    status: { $in: ["confirmed", "in_progress"] },
    date: { $gte: new Date(Date.now() - 2 * 3600 * 1000) },
  }).sort({ date: 1 }).lean();

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-700">Consultations</h1>
      <p className="text-slate-500 mt-1">Live and upcoming video consultations.</p>

      {sessions.length === 0 ? (
        <div className="mt-6 text-center py-16 bg-white border border-dashed rounded-xl">
          <Video className="size-10 mx-auto text-slate-300" />
          <p className="mt-3 text-slate-500">No active consultations</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {sessions.map((b: any) => {
            const live = new Date(b.date) <= new Date();
            return (
              <Link key={String(b._id)} href={`/owner/consultations/${b._id}`}
                className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-xl bg-blue-50 grid place-items-center"><Video className="size-5 text-blue-600" /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{b.petName} · {b.vetName}</p>
                      {live && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse">● LIVE</span>}
                    </div>
                    <p className="text-sm text-slate-500">{new Date(b.date).toLocaleString()}</p>
                  </div>
                  <span className="text-blue-600 font-medium text-sm">{live ? "Join →" : "Open"}</span>
                </div>
              </Link>
            );
          })}
        </ul>
      )}
    </div>
  );
}
