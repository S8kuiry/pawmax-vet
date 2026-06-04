import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import MedicalRecord from "@/models/MedicalRecord";
import Pet from "@/models/Pet";

export default async function VetRecordsPage() {
  const session = await getSession();
  await dbConnect();
  const records = await MedicalRecord.find({ vetId: session!.id })
    .sort({ date: -1 })
    .limit(50)
    .lean();
  const petIds = [...new Set(records.map((r) => String(r.petId)))];
  const pets = await Pet.find({ _id: { $in: petIds } }).select("name").lean();
  const petMap = Object.fromEntries(pets.map((p) => [String(p._id), p.name]));

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Clinical</p>
        <h1 className="text-3xl font-semibold">Records</h1>
        <p className="mt-2 text-slate-500">SOAP notes, labs, and clinical documentation.</p>
      </div>

      {records.length === 0 ? (
        <p className="text-sm text-slate-500">No records yet.</p>
      ) : (
        <ul className="space-y-3">
          {records.map((r) => (
            <li key={String(r._id)} className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className="flex justify-between gap-4">
                <div>
                  <p className="font-medium">{r.summary || "Clinical record"}</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {petMap[String(r.petId)]} · {r.type} · {new Date(r.date as Date).toLocaleDateString()}
                  </p>
                </div>
                {r.petId && (
                  <Link href={`/vet/patients/${r.petId}`} className="text-sm text-blue-600 shrink-0">Patient →</Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
