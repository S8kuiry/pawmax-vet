import Link from "next/link";
import { PawPrint, Cake } from "lucide-react";

export function PetCard({ pet }: { pet: {
  _id: string; name: string; species: string; breed?: string;
  dob?: string; photoUrl?: string;
}}) {
  const age = pet.dob
    ? Math.floor((Date.now() - new Date(pet.dob).getTime()) / 31557600000)
    : null;

  return (
    <Link
      href={`/owner/pets/${pet._id}`}
      className="group rounded-xl border border-blue-100 bg-white p-4 flex items-center gap-4 hover:border-blue-300 hover:shadow-md transition"
    >
      <div className="size-14 rounded-xl overflow-hidden bg-blue-50 grid place-items-center shrink-0">
        {pet.photoUrl
          ? <img src={pet.photoUrl} alt={pet.name} className="w-full h-full object-cover" />
          : <PawPrint className="size-7 text-blue-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 group-hover:text-blue-700">{pet.name}</p>
        <p className="text-sm text-slate-500 truncate">
          {pet.species}{pet.breed ? ` · ${pet.breed}` : ""}
        </p>
        {age !== null && (
          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
            <Cake className="size-3" /> {age} yr{age !== 1 && "s"}
          </p>
        )}
      </div>
    </Link>
  );
}
