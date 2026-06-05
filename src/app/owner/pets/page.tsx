import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Pet from "@/models/Pet";
import { getSession } from "@/lib/auth";
import { PawPrint, Plus, Scale, Calendar, PawPrintIcon } from "lucide-react";

export default async function PetsPage() {
  const session = await getSession();
  await dbConnect();
  const pets = await Pet.find({ ownerId: session!.id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="max-w-6xl mx-auto space-y-8 py-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">My Pets</h1>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Manage your pet profiles, health milestones, and detailed medical history timelines.
          </p>
        </div>
        <Link 
          href="/owner/pets/new" 
          className="inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm hover:bg-blue-700 transition shrink-0"
        >
          <Plus className="size-4" /> Add New Pet
        </Link>
      </div>

      {pets.length === 0 ? (
        /* Modern Empty State */
        <div className="flex flex-col items-center justify-center text-center py-20 bg-slate-50/50 border border-slate-200 border-dashed rounded-2xl p-6">
          <div className="size-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <PawPrintIcon className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No pets added yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            Get started by creating a dedicated profile for your animal companion to track their records.
          </p>
          <Link 
            href="/owner/pets/new" 
            className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
          >
            Add your first pet <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        /* Premium Card Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {pets.map((p: any) => (
            <Link 
              key={String(p._id)} 
              href={`/owner/pets/${p._id}`}
              className="group relative flex flex-col justify-between bg-white border border-slate-200 rounded-2xl p-5 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition duration-200"
            >
              <div className="flex items-center gap-4">
                {/* Visual Accent Initial Avatar */}
                <div className="size-11 rounded-xl bg-blue-50/70 text-blue-600 flex items-center justify-center font-bold text-base group-hover:bg-blue-100 transition shrink-0">
                  <PawPrintIcon className="size-6" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition truncate">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 truncate mt-0.5">
                    {p.breed ? `${p.breed} (${p.species})` : (p.species as string)}
                  </p>
                </div>
              </div>

              {/* Iconographic Metric Footer */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-4 text-xs text-slate-500 font-medium pl-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Scale className="size-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{p.weightKg ? `${p.weightKg} kg` : "— kg"}</span>
                </div>
                
                {p.birthDate && (
                  <div className="flex items-center gap-1.5 min-w-0 border-l border-slate-200 pl-4">
                    <Calendar className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{age(p.birthDate)} old</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function age(dob: string) {
  const y = (Date.now() - new Date(dob).getTime()) / (365.25 * 864e5);
  return y < 1 ? `${Math.round(y * 12)} mo` : `${Math.floor(y)} yr`;
}