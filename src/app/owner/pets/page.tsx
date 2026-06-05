import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Pet from "@/models/Pet";
import { getSession } from "@/lib/auth";
import { PawPrintIcon, Plus, Scale, Calendar, Edit3, EllipsisVerticalIcon, Trash2 } from "lucide-react";

export default async function PetsPage() {
  const session = await getSession();
  await dbConnect();
  const pets = await Pet.find({ ownerId: session!.id }).sort({ createdAt: -1 }).lean();

  return (
    /* Full-Bleed Fluid Layout Frame with Dark Blue Matrix Canvas */
    <div className="min-h-screen bg-[#FFFFF] text-slate-200 w-full ">

      {/* Top Action Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-6 ">
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
        <div className="flex flex-col items-center justify-center text-center py-20 bg-[#111726]/20 border border-dashed border-slate-800 rounded-xl p-6 max-w-xl mx-auto">
          <div className="size-11 rounded-lg border border-blue-500/10 bg-blue-500/5 flex items-center justify-center text-slate-400 mb-4">
            <PawPrintIcon className="size-5" />
          </div>
          <h3 className="text-xs font-semibold text-slate-300">No pets added yet</h3>
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
        /* Premium Card Grid System (Optimized for Larger Cards)
          - Changed max columns from xl:grid-cols-4 down to xl:grid-cols-3 to widen cards
          - Scaled layout gap up to gap-5 for visual balance
        */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
          {pets.map((p: any) => (
            <div
              key={String(p._id)}
              /* Added min-h-[150px] and p-5 to expand card presence safely */
              className="group relative flex flex-col justify-between bg-[#0f172a] border border-blue-950/70 rounded-xl p-5 min-h-[150px] hover:border-blue-500/40 hover:bg-[#131c35] transition-all duration-200 shadow-sm"
            >
              {/* FIXED Overlay Link: Removed h-[380px] w-[400px] so it fills the expanded parent wrapper perfectly */}
              <Link
                href={`/owner/pets/${p._id}`}
                className="absolute inset-0 z-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={`View ${p.name}'s profile`}
              />

              {/* Top Section Cluster */}
              <div className="flex items-start justify-between gap-2 relative z-10">
                <div className="flex items-center gap-3 min-w-0 pointer-events-none">
                  {/* Expanded Decorative Icon Bracket */}
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

                {/* Top-Right Interactive Hover Actions Menu */}
                <div className="relative group/menu z-20 shrink-0">

                  {/* Anchor Button Indicator */}
                  <button
                    type="button"
                    className="size-7 rounded border border-slate-800 bg-[#161f30] flex items-center justify-center text-slate-400 group-hover/menu:text-blue-400 group-hover/menu:border-blue-500/40 group-hover/menu:bg-[#1b263b] transition-all duration-150 shadow-inner"
                    title="Open management options"
                  >
                    <EllipsisVerticalIcon className="size-3.5" />
                  </button>

                  {/* Dropdown Card Array Container */}
                  <div className="absolute right-0 top-full mt-1 w-28 bg-[#0f172a] border border-slate-800 rounded-lg shadow-xl opacity-0 scale-95 pointer-events-none group-hover/menu:opacity-100 group-hover/menu:scale-100 group-hover/menu:pointer-events-auto transition-all duration-150 z-30 overflow-hidden">

                    {/* Option 1: Edit Link Gateway */}
                    <Link
                      href={`/owner/pets/${p._id}/edit`}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-[11px] font-bold text-slate-300 hover:text-white hover:bg-blue-600/20 border-b border-slate-800/60 transition-colors"
                    >
                      <Edit3 className="size-3 text-blue-400" />
                      Edit Info
                    </Link>

                    {/* Option 2: Destructive Delete Form Action Request */}
                    <form action={`/api/pets/${p._id}/delete`} method="POST" className="w-full">
                      <button
                        type="submit"
                        className="flex items-center gap-2 w-full text-left px-3 py-2 text-[11px] font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="size-3 text-rose-500" />
                        Remove
                      </button>
                    </form>

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

// Age Chronology Normalizer
function age(dob: string) {
  const y = (Date.now() - new Date(dob).getTime()) / (365.25 * 864e5);
  return y < 1 ? `${Math.round(y * 12)} mo` : `${Math.floor(y)} yr`;
}