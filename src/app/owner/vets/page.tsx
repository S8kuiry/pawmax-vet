import Link from "next/link";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { Stethoscope, Search, Star } from "lucide-react";

export default async function VetsPage({ searchParams }: { searchParams: Promise<{ q?: string; specialty?: string }> }) {
  const { q = "", specialty = "" } = await searchParams;
  await dbConnect();

  const filter: Record<string, unknown> = { role: "vet", status: "active" };
  if (q) filter.name = { $regex: q, $options: "i" };
  if (specialty) filter.specialty = { $regex: specialty, $options: "i" };

  const vets = await User.find(filter).limit(50).lean();
  const specialties = ["General", "Surgery", "Dermatology", "Dentistry", "Behavior", "Exotic"];

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-700">Find a Vet</h1>
      <p className="text-slate-500 mt-1">Browse verified veterinarians and book a consultation.</p>

      <form className="mt-6 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input name="q" defaultValue={q} placeholder="Search by name…"
            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 outline-none" />
        </div>
        <select name="specialty" defaultValue={specialty} className="px-3 py-2 border border-slate-300 rounded-lg">
          <option value="">All specialties</option>
          {specialties.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">Search</button>
      </form>

      <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vets.length === 0 && <p className="text-slate-500">No vets match your filters.</p>}
        {vets.map((v: any) => (
          <Link key={String(v._id)} href={`/owner/vets/${v._id}`}
            className="bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-300 hover:shadow-sm transition">
            <div className="flex items-start gap-3">
              <div className="size-12 rounded-full bg-blue-100 text-blue-700 grid place-items-center font-semibold">
                {v.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-blue-700">Dr. {v.name}</p>
                <p className="text-sm text-slate-500 truncate">{v.specialty || "General Practice"}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-amber-500">
                  <Star className="size-3 fill-current" /> 4.8
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t text-sm flex justify-between text-slate-600">
              <span>{v.consultationFee ? `₹${v.consultationFee}/visit` : "Free"}</span>
              <span className="text-blue-600 font-medium">View →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
