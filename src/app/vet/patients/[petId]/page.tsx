import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Pet from "@/models/Pet";
import User from "@/models/User";
import MedicalRecord from "@/models/MedicalRecord";
import Booking from "@/models/Booking";

export default async function VetPatientDetail({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const session = await getSession();
  await dbConnect();

  const hasBooking = await Booking.exists({ vetId: session!.id, petId });
  if (!hasBooking) notFound();

  const pet = await Pet.findById(petId).lean();
  if (!pet) notFound();

  const owner = await User.findById(pet.ownerId).select("name phone email").lean();
  const records = await MedicalRecord.find({ petId, vetId: session!.id }).sort({ date: -1 }).limit(20).lean();

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Patient</p>
        <h1 className="text-3xl font-semibold">{pet.name as string}</h1>
        <p className="mt-2 text-slate-500">
          {pet.species as string} · {(pet.breed as string) || "—"} · {pet.weightKg ? `${pet.weightKg} kg` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <section className="xl:col-span-2 rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Medical history (your records)</h2>
          {records.length === 0 ? (
            <p className="text-sm text-slate-500">No records documented yet.</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {records.map((r) => (
                <li key={String(r._id)} className="flex justify-between border-b border-slate-100 pb-3">
                  <span>{r.summary || r.type}</span>
                  <span className="text-slate-500">{new Date(r.date as Date).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
        <aside className="rounded-2xl bg-white border border-slate-200 p-6">
          <h2 className="text-lg font-semibold mb-4">Owner</h2>
          <p className="font-medium">{owner?.name || "—"}</p>
          <p className="text-sm text-slate-500">{owner?.phone || owner?.email || ""}</p>
          <Link href="/vet/records" className="inline-block mt-4 text-sm text-blue-600">Add record →</Link>
        </aside>
      </div>
    </div>
  );
}
