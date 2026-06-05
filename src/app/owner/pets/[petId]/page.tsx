import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Pet from "@/models/Pet";
import MedicalRecord from "@/models/MedicalRecord";
import { getSession } from "@/lib/auth";
import { 
  PawPrint, 
  Syringe, 
  Stethoscope, 
  Pill, 
  FlaskConical, 
  ArrowLeft, 
  Scale, 
  Calendar, 
  ShieldAlert, 
  UserRound 
} from "lucide-react";

// Icon layout dictionary
const iconMap: Record<string, any> = { 
  Vaccine: Syringe, 
  Visit: Stethoscope, 
  Prescription: Pill, 
  Lab: FlaskConical 
};

export default async function PetDetail({ params }: { params: Promise<{ petId: string }> }) {
  const { petId } = await params;
  const session = await getSession();
  
  await dbConnect();
  
  const pet = await Pet.findOne({ _id: petId, ownerId: session!.id }).lean() as any;
  if (!pet) notFound();
  
  const records = await MedicalRecord.find({ petId }).sort({ date: -1 }).lean();

  return (
    /* Light Canvas Framework */
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 w-full py-10 px-6 md:px-8 lg:px-12 antialiased">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation Toolbar Segment */}
        <div>
          <Link 
            href="/owner/pets" 
            className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="size-3.5" /> Back to All Pets
          </Link>
        </div>

        {/* Hero Identity Banner Section */}
        <div className="bg-[#0f172a] border border-blue-950/70 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            {/* Glowing Accent Icon Matrix Box */}
            <div className="size-16 rounded-2xl border border-blue-500/20 bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 shadow-inner">
              <PawPrint className="size-8" />
            </div>
            
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 block">Patient Profile</span>
              <h1 className="text-2xl font-bold tracking-tight text-white leading-none">{pet.name}</h1>
              <p className="text-xs text-slate-400 font-medium">
                {pet.species} <span className="text-slate-600">·</span> {pet.breed || "Unspecified Breed"}
              </p>
            </div>
          </div>

          {/* Core Vital Stats Metrics Strip */}
          <div className="flex items-center gap-4 text-xs font-semibold border-t sm:border-t-0 pt-4 sm:pt-0 border-slate-800/80">
            <div className="bg-[#161f30] border border-slate-800/60 rounded-xl px-4 py-2.5 min-w-[90px]">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">Weight</span>
              <div className="flex items-center gap-1.5 text-slate-200">
                <Scale className="size-3.5 text-blue-400" />
                <span>{pet.weightKg ?? "—"} kg</span>
              </div>
            </div>

            {pet.birthDate && (
              <div className="bg-[#161f30] border border-slate-800/60 rounded-xl px-4 py-2.5 min-w-[100px]">
                <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-0.5">Chronology</span>
                <div className="flex items-center gap-1.5 text-slate-200">
                  <Calendar className="size-3.5 text-blue-400" />
                  <span>{age(pet.birthDate)} old</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Timeline Tracking Block Container */}
        <div className="space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Clinical Evaluation Timeline</h2>
            <p className="text-sm font-bold text-slate-900 mt-0.5">Medical History Logs</p>
          </div>

          {records.length === 0 ? (
            /* Empty State Box */
            <div className="flex flex-col items-center justify-center text-center py-14 bg-white border border-dashed border-slate-200 rounded-2xl p-6">
              <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <ShieldAlert className="size-5" />
              </div>
              <h3 className="text-xs font-bold text-slate-800">No logs on file</h3>
              <p className="mt-1 text-[11px] text-slate-400 max-w-xs leading-relaxed">
                This entity does not currently have any historical clinical procedures or check-up metrics cataloged.
              </p>
            </div>
          ) : (
            /* Premium Micro-Typography Card Array List */
            <ol className="space-y-3.5">
              {records.map((r: any) => {
                const RecordIcon = iconMap[r.type] || Stethoscope;
                return (
                  <li 
                    key={String(r._id)} 
                    className="bg-white border border-slate-200/80 rounded-2xl p-5 flex gap-4 shadow-sm hover:border-slate-300 transition-all duration-150"
                  >
                    {/* Deep Midnight Minimalist Icon Wrapper */}
                    <div className="size-10 rounded-xl bg-[#0f172a] border border-blue-950/40 flex items-center justify-center shrink-0 shadow-sm">
                      <RecordIcon className="size-4.5 text-blue-400" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <p className="text-sm font-bold text-slate-900 tracking-tight">{r.summary}</p>
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md self-start sm:self-center">
                          {new Date(r.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Meta-metrics Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-slate-500">
                        <span className="text-blue-600 font-bold uppercase tracking-wider">{r.type}</span>
                        <span className="text-slate-300">•</span>
                        <div className="flex items-center gap-1">
                          <UserRound className="size-3 text-slate-400" />
                          <span>{r.vetName}</span>
                        </div>
                      </div>

                      {/* Extended Operational Logs/Notes */}
                      {r.notes && (
                        <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mt-1">
                          <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Clinical Evaluation Notes</span>
                          <p className="text-xs text-slate-600 leading-relaxed font-medium">{r.notes}</p>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

      </div>
    </div>
  );
}

// Age Chronology Normalizer
function age(dob: string) {
  const y = (Date.now() - new Date(dob).getTime()) / (365.25 * 864e5);
  return y < 1 ? `${Math.round(y * 12)} mo` : `${Math.floor(y)} yr`;
}