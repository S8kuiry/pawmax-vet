import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Booking from "@/models/Booking";
import Pet from "@/models/Pet";

export default async function VetPatientsPage() {
  const session = await getSession();
  await dbConnect();
  const petIds = await Booking.distinct("petId", { vetId: session!.id });
  const patients = await Pet.find({ _id: { $in: petIds } }).sort({ name: 1 }).lean();

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Clinical</p>
        <h1 className="text-3xl font-semibold">Patients</h1>
        <p className="mt-2 text-slate-500">All pets you have seen or have upcoming bookings with.</p>
      </div>

      {patients.length === 0 ? (
        <p className="text-sm text-slate-500">No patients yet. Bookings will populate this list.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {patients.map((p) => (
            <Link key={String(p._id)} href={`/vet/patients/${p._id}`} className="rounded-2xl bg-white border border-slate-200 p-5 hover:border-blue-300 transition">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-blue-50 grid place-items-center text-blue-700 font-semibold">
                  {(p.name as string)[0]}
                </div>
                <div>
                  <p className="font-semibold">{p.name as string}</p>
                  <p className="text-sm text-slate-500">{p.species as string} · {(p.breed as string) || "—"}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
