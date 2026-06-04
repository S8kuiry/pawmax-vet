import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Prescription from "@/models/Prescription";
import { getSession } from "@/lib/auth";
import { enrichPrescriptionsForOwner } from "@/lib/booking-display";
import { Pill } from "lucide-react";

export default async function PrescriptionsPage() {
  const session = await getSession();
  await dbConnect();
  const raw = await Prescription.find({ ownerId: session!.id }).sort({ issuedAt: -1 }).lean();
  const items = await enrichPrescriptionsForOwner(raw as Record<string, unknown>[]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-700">Prescriptions</h1>
      <p className="text-slate-500 mt-1">All medications prescribed across your pets.</p>

      {items.length === 0 ? (
        <div className="mt-6 text-center py-16 bg-white border border-dashed rounded-xl">
          <Pill className="size-10 mx-auto text-slate-300" />
          <p className="mt-3 text-slate-500">No prescriptions yet</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((r) => (
            <Link key={String(r._id)} href={`/owner/prescriptions/${r._id}`}
              className="block bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{r.medication}</p>
                  <p className="text-sm text-slate-500">{r.dosage} · for {r.petName}</p>
                  <p className="text-xs text-slate-400 mt-1">Prescribed by {r.vetName} on {new Date(r.issuedAt as string).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${r.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                  {r.active ? "Active" : r.status}
                </span>
              </div>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
}
