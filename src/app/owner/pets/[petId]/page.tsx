import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Pet from "@/models/Pet";
import MedicalRecord from "@/models/MedicalRecord";
import { getSession } from "@/lib/auth";
import { PawPrint, Syringe, Stethoscope, Pill, FlaskConical, ArrowLeft } from "lucide-react";

const iconMap: Record<string, any> = { Vaccine: Syringe, Visit: Stethoscope, Prescription: Pill, Lab: FlaskConical };

export default async function PetDetail({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const session = await getSession();
  await dbConnect();
  const pet = await Pet.findOne({ _id: petId, ownerId: session!.id }).lean() as any;
  if (!pet) notFound();
  const records = await MedicalRecord.find({ petId }).sort({ date: -1 }).lean();

  return (
    <div>
      <Link href="/owner/pets" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="size-4" /> Back to pets
      </Link>

      <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-2xl p-6 flex items-center gap-5">
        <div className="size-16 rounded-2xl bg-white/20 grid place-items-center"><PawPrint className="size-8" /></div>
        <div>
          <h1 className="text-2xl font-bold">{pet.name}</h1>
          <p className="text-blue-100">{pet.species} · {pet.breed || "—"} · {pet.weightKg ?? "—"} kg</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mt-8 mb-4">Medical history</h2>
      {records.length === 0 ? (
        <div className="text-center py-10 bg-white border border-dashed rounded-xl text-slate-500">No medical records yet</div>
      ) : (
        <ol className="space-y-3">
          {records.map((r: any) => {
            const Icon = iconMap[r.type] || Stethoscope;
            return (
              <li key={String(r._id)} className="bg-white border border-slate-200 rounded-xl p-4 flex gap-4">
                <div className="size-10 rounded-lg bg-blue-50 grid place-items-center shrink-0"><Icon className="size-4 text-blue-600" /></div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{r.summary}</p>
                    <span className="text-xs text-slate-500">{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-sm text-slate-500 mt-1">{r.type} · {r.vetName}</p>
                  {r.notes && <p className="text-sm text-slate-600 mt-2">{r.notes}</p>}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
