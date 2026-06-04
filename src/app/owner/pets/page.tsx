import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Pet from "@/models/Pet";
import { getSession } from "@/lib/auth";
import { PawPrint, Plus } from "lucide-react";

export default async function PetsPage() {
  const session = await getSession();
  await dbConnect();
  const pets = await Pet.find({ ownerId: session!.id }).sort({ createdAt: -1 }).lean();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-700">My Pets</h1>
          <p className="text-slate-500 mt-1">Manage your pet profiles and medical history.</p>
        </div>
        <Link href="/owner/pets/new" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Plus className="size-4" /> Add Pet
        </Link>
      </div>

      {pets.length === 0 ? (
        <div className="text-center py-20 bg-white border border-dashed border-slate-300 rounded-xl">
          <PawPrint className="size-10 mx-auto text-slate-300" />
          <p className="mt-3 text-slate-500">No pets added yet</p>
          <Link href="/owner/pets/new" className="inline-block mt-4 text-blue-600 font-medium hover:underline">Add your first pet →</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pets.map((p: any) => (
            <Link key={String(p._id)} href={`/owner/pets/${p._id}`}
              className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-xl bg-blue-50 grid place-items-center">
                  <PawPrint className="size-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-blue-700">{p.name}</p>
                  <p className="text-sm text-slate-500">{p.species} · {p.breed}</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-600">
                Weight: {p.weightKg ?? "—"} kg {p.dob && `· Age: ${age(p.dob)}`}
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
