import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { Stethoscope, Search, Star, SlidersHorizontal, ArrowRight, IndianRupee, Briefcase, MapPin, ShieldAlert } from "lucide-react";
import Vet from "@/models/Vet";

export default async function VetsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string; specialty?: string }> 
}) {
  const { q = "", specialty = "" } = await searchParams;
  await dbConnect();

  // FIX 1: Allow both "active" and "draft" statuses so newly registered accounts show up immediately!
  const filter: Record<string, unknown> = { 
    role: "vet", 
    status: { $in: ["active", "draft"] } 
  };

  if (q) filter.name = { $regex: q, $options: "i" };
  
  // FIX 2: Your schema defines the field as 'specializations' (array), not 'specialty' (string)
  if (specialty) filter.specializations = { $regex: specialty, $options: "i" };

  const vets = await Vet.find(filter).limit(50).lean();
  const specialties = ["General", "Surgery", "Dermatology", "Dentistry", "Behavior", "Exotic"];

  return (
    <div className="min-h-screen ">
      
      {/* Header Section */}
      <div className="border-b border-slate-100 pb-6">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block mb-1">Medical Directory</span>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Find a Veterinarian</h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl leading-relaxed">
          Connect with trusted, verified animal healthcare specialists and book medical consultations for your pets.
        </p>
      </div>

      {/* Modern Filter Hub Bar */}
      <form method="GET" action="/owner/vets" className="-mt-3 mb-6 flex flex-col sm:flex-row gap-3 bg-white p-2 border border-slate-200/80 rounded-xl shadow-xs">
        {/* Keyword Text Search */}
        <div className="relative flex-1 ">
          <Search className="size-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            name="q" 
            defaultValue={q} 
            placeholder="Search providers by name..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition" 
          />
        </div>

        {/* Specialty Filter Dropdown */}
        <div className="relative min-w-[180px]">
          <SlidersHorizontal className="size-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <select 
            name="specialty" 
            defaultValue={specialty} 
            className="w-full pl-10 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition appearance-none cursor-pointer text-slate-700"
          >
            <option value="">All Specialties</option>
            {specialties.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none border-l border-slate-200 pl-2">
            <svg className="size-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Action Button */}
        <button type="submit" className="bg-slate-900 text-white text-xs font-semibold px-5 py-2 rounded-lg hover:bg-slate-800 shadow-sm transition shrink-0">
          Apply Filters
        </button>
      </form>

      {/* Grid Results Zone */}
      {vets.length === 0 ? (
        <div className="border border-dashed border-slate-200 rounded-xl p-16 text-center bg-slate-50/20 max-w-lg mx-auto">
          <Stethoscope className="size-5 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-700">No medical providers match</p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto mt-0.5 leading-relaxed">
            We couldn't find any active doctors matching your search parameters. Try adjusting your keywords.
          </p>
          <Link href="/owner/vets" className="mt-4 inline-block text-xs font-bold text-blue-600 hover:text-blue-700">
            Clear all filters
          </Link>
        </div>
      ) : (
        /* Premium Providers Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
  {vets.map((v: any) => {
    const initials = v.name.split(" ").map((n: string) => n[0]).slice(0, 2).join("").toUpperCase();
    
    // Pull array data safely from the schema field 'specializations'
    const primarySpecialty = v.specializations && v.specializations.length > 0 
      ? v.specializations.join(", ") 
      : "General Medicine";

    return (
      <Link 
        key={String(v._id)} 
        href={`/owner/vets/${v._id}/book`}
        className="group w-[380px] relative flex flex-col justify-between bg-[#0f172a] border border-blue-950/70 hover:border-blue-500/40 hover:bg-[#131c35] rounded-xl p-4 transition-all duration-200 shadow-md text-slate-300"
      >
        <div>
          <div className="flex items-start gap-3.5">
            
            {/* Luminous High-Contrast Avatar */}
            <div className="size-10 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-200">
              {initials}
            </div>

            {/* Meta Body Content */}
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-bold text-white group-hover:text-blue-400 tracking-tight text-sm transition-colors truncate">
                  Dr. {v.name}
                </h3>
                
                {/* Dark-Theme Sandbox Status Flag */}
                {v.status === "draft" && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-black bg-amber-500/10 border border-amber-500/20 text-amber-400 px-1 py-0.2 rounded shrink-0 uppercase tracking-wide">
                    <ShieldAlert className="size-2.5" /> Draft
                  </span>
                )}
              </div>
              
              {/* Specialized Medical Category Label */}
              <p className="text-[11px] font-medium text-slate-400 truncate">
                {primarySpecialty}
              </p>

              {/* Technical Indicator Badges */}
              <div className="flex items-center gap-2 pt-1">
                
                {/* Dark Rating Box */}
                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-200 bg-slate-800/80 border border-slate-700/40 rounded px-1.5 py-0.5">
                  <Star className="size-2.5 text-amber-400 fill-current" /> 
                  <span>{v.rating > 0 ? v.rating.toFixed(1) : "New"}</span>
                </div>

                {/* Dark Experience Box */}
                <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-slate-800/50 border border-slate-800 rounded px-1.5 py-0.5">
                  <Briefcase className="size-2.5 text-slate-500" />
                  <span>{v.yearsOfExperience || 0} Yrs</span>
                </div>
                
              </div>
            </div>
          </div>
        </div>

        {/* Separator and Interactive Action Deck */}
        <div className="mt-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs font-medium text-slate-400">
          
          {/* Fee Vector Indicator */}
          <div className="flex items-center gap-0.5 text-slate-200">
            <IndianRupee className="size-3 text-slate-500" />
            <span className="text-xs font-bold text-white">
              {v.consultationFee ? `${v.consultationFee}` : "0"}
            </span>
            <span className="text-slate-500 font-normal text-[11px] ml-0.5">/ session</span>
          </div>
          
          {/* Call-to-Action Link Anchor */}
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-400 group-hover:text-blue-300 group-hover:gap-1.5 transition-all">
            Book Consultation <ArrowRight className="size-3" />
          </span>
          
        </div>
      </Link>
    );
  })}
</div>


      )}
    </div>
  );
}