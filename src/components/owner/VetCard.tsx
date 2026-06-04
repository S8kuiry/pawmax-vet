import Link from "next/link";
import { Star, BadgeCheck } from "lucide-react";

export function VetCard({ vet }: { vet: {
  _id: string; name: string; specialties?: string[];
  rating?: number; fee?: number; photoUrl?: string; kycStatus?: string;
}}) {
  return (
    <Link
      href={`/owner/vets/${vet._id}`}
      className="rounded-xl border border-blue-100 bg-white p-5 hover:border-blue-300 hover:shadow-md transition flex gap-4"
    >
      <div className="size-16 rounded-full bg-blue-100 overflow-hidden shrink-0 grid place-items-center text-blue-700 font-semibold">
        {vet.photoUrl
          ? <img src={vet.photoUrl} alt={vet.name} className="w-full h-full object-cover" />
          : vet.name.slice(0,2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-slate-800 truncate">Dr. {vet.name}</p>
          {vet.kycStatus === "approved" && <BadgeCheck className="size-4 text-blue-500" />}
        </div>
        <p className="text-sm text-slate-500 truncate">
          {vet.specialties?.join(" · ") || "General Practice"}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="flex items-center gap-1 text-sm text-amber-600">
            <Star className="size-3.5 fill-amber-500 stroke-amber-500" />
            {vet.rating?.toFixed(1) ?? "—"}
          </span>
          {vet.fee != null && (
            <span className="text-sm font-semibold text-blue-700">₹{vet.fee}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
