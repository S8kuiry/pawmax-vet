import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Pet from "@/models/Pet";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { PawPrintIcon, Plus, Scale, Calendar, Edit3, EllipsisVerticalIcon } from "lucide-react";
import DeletePetForm from "./DeletePetForm"; // 🟢 Import the new client confirmation component

export default async function PetsPage() {
  const session = await getSession();
  await dbConnect();
  const pets = await Pet.find({ ownerId: session!.id }).sort({ createdAt: -1 }).lean();

  async function removePet(formData: FormData) {
    "use server";
    const petId = formData.get("petId") as string;
    if (!session?.id || !petId) return;

    await dbConnect();
    await Pet.deleteOne({ _id: petId, ownerId: session.id });
    
    revalidatePath("/owner/pets");
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-200 w-full">

      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 block mb-1">Patient Matrix</span>
          <h1 className="text-xl font-bold tracking-tight text-blue-500">My Pets</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
            Manage your pet profiles, health milestones, and detailed medical history timelines.
          </p>
        </div>

        <Link
          href="/owner/pets/new"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-xs font-semibold transition shadow-md shrink-0"
        >
          <Plus className="size-3.5" /> Add New Pet
        </Link>
      </div>

      {/* Document Stack / Empty State Pipeline */}
      {pets.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-blue-200/5 border border-dashed border-slate-800 rounded-xl p-6 max-w-xl mx-auto">
          <div className="size-11 shadow-lg shadow-blue-500/50 rounded-lg border border-blue-500/10 bg-white flex items-center justify-center text-slate-400 mb-4">
            <PawPrintIcon className="size-5" />
          </div>
          <h3 className="text-xs font-semibold text-slate-500">No pets added yet</h3>
          <p className="mt-1 text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
            Get started by creating a dedicated profile for your animal companion to track their records.
          </p>
          <Link
            href="/owner/pets/new"
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            Add your first pet <span aria-hidden="true">→</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {pets.map((p: any) => (
            <div
              key={String(p._id)}
              className="group relative flex flex-col justify-between bg-[#0f172a] border border-blue-950/70 rounded-xl p-5 min-h-[150px] hover:border-blue-500/40 hover:bg-[#131c35] transition-all duration-200 shadow-sm"
            >
              <Link
                href={`/owner/pets/${p._id}`}
                className="absolute inset-0 z-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={`View ${p.name}'s profile`}
              />

              {/* Top Section Cluster */}
              <div className="flex items-start justify-between gap-2 relative z-10">
                <div className="flex items-center gap-3 min-w-0 pointer-events-none">
                  <div className="size-10 rounded-lg border border-blue-500/10 bg-blue-500/5 flex items-center justify-center shrink-0 text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/30 transition-all duration-200">
                    <PawPrintIcon className="size-4.5 shrink-0" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-white tracking-tight group-hover:text-blue-400 transition-colors truncate">
                      {p.name}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium truncate mt-0.5">
                      {p.breed ? `${p.breed} (${p.species})` : (p.species as string)}
                    </p>
                  </div>
                </div>

                {/* Action Menu Outer Wrapper */}
                <div className="relative group/menu z-20 shrink-0 pb-2 -mb-2">
                  
                  <button
                    type="button"
                    className="size-7 rounded border border-slate-800 bg-[#161f30] flex items-center justify-center text-slate-400 group-hover/menu:text-blue-400 group-hover/menu:border-blue-500/40 group-hover/menu:bg-[#1b263b] transition-all duration-150 shadow-inner"
                    title="Open management options"
                  >
                    <EllipsisVerticalIcon className="size-3.5" />
                  </button>

                  {/* Dropdown Card Panel with Hover Shroud Buffer */}
                  <div className="absolute right-0 top-full w-28 bg-[#0f172a] border border-slate-800 rounded-lg shadow-xl opacity-0 scale-95 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:scale-100 group-hover/menu:pointer-events-auto transition-all duration-150 z-30 overflow-hidden
                    before:absolute before:inset-0 before:-top-4 before:-left-4 before:-right-4 before:content-[''] before:z-[-1]">
                    
                    <Link
                      href={`/owner/pets/${p._id}/edit`}
                      className="relative z-10 flex items-center gap-2 w-full text-left px-3 py-2 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-blue-600/20 border-b border-slate-800/60 transition-colors"
                    >
                      <Edit3 className="size-3 text-blue-400" />
                      Edit Info
                    </Link>

                    {/* 🟢 FIXED: Swapped with our custom confirmation component */}
                    <DeletePetForm 
                      petId={String(p._id)} 
                      petName={p.name} 
                      removePetAction={removePet} 
                    />

                  </div>
                </div>
              </div>

              {/* Iconographic Vital Metric Footer */}
              <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center gap-4 text-[11px] text-slate-400 font-medium relative z-10 pointer-events-none">
                <div className="flex items-center gap-1.5 min-w-0">
                  <Scale className="size-3.5 text-slate-500 shrink-0" />
                  <span className="truncate text-slate-300 font-semibold">
                    {p.weightKg ? `${p.weightKg} kg` : "— kg"}
                  </span>
                </div>

                {p.birthDate && (
                  <div className="flex items-center gap-1.5 min-w-0 border-l border-slate-800 pl-4">
                    <Calendar className="size-3.5 text-slate-500 shrink-0" />
                    <span className="truncate text-slate-300 font-semibold">
                      {age(p.birthDate)} old
                    </span>
                  </div>
                )}
              </div>

            </div>
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