import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Prescription from "@/models/Prescription";
import { getSession } from "@/lib/auth";
import { enrichPrescriptionsForOwner } from "@/lib/booking-display";
import { Pill, Calendar, User, PawPrint } from "lucide-react";

export default async function PrescriptionsPage() {
  const session = await getSession();
  await dbConnect();
  const raw = await Prescription.find({ ownerId: session!.id }).sort({ issuedAt: -1 }).lean();
  const items = await enrichPrescriptionsForOwner(raw as Record<string, unknown>[]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4">
      {/* Header Section */}
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Prescriptions</h1>
        <p className="text-sm text-slate-500 mt-2 max-w-2xl leading-relaxed">
          Manage and track active medications, dosage instructions, and historical prescriptions issued for your pets.
        </p>
      </div>

      {items.length === 0 ? (
        /* Modernized Empty State */
        <div className="flex flex-col items-center justify-center text-center py-20 bg-blue-50/50 border border-slate-300 border-dashed rounded-2xl p-6">
          <div className="size-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-400 mb-4">
            <Pill className="size-6" />
          </div>
          <h3 className="text-base font-semibold text-slate-900">No prescriptions yet</h3>
          <p className="mt-1 text-sm text-slate-500 max-w-sm">
            When a veterinarian issues a medication during an appointment, it will appear here instantly.
          </p>
        </div>
      ) : (
        /* Modernized Cards Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((r) => {
            const isActive = r.active;
            
            return (
              <Link 
                key={String(r._id)} 
                href={`/owner/prescriptions/${r._id}`}
                className="group relative flex flex-col justify-between bg-white border border-slate-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition duration-200"
              >
                <div>
                  {/* Card Header: Title & Status */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`size-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-400"
                      }`}>
                        <Pill className="size-5" />
                      </div>
                      <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition truncate">
                        {r.medication}
                      </h3>
                    </div>

                    <span className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-medium ring-1 ring-inset shrink-0 ${
                      isActive 
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/10" 
                        : "bg-slate-50 text-slate-600 ring-slate-500/10"
                    }`}>
                      <span className={`mr-1.5 size-1.5 rounded-full ${isActive ? "bg-emerald-500" : "bg-slate-400"}`} />
                      {isActive ? "Active" : r.status || "Completed"}
                    </span>
                  </div>

                  {/* Dosage Description */}
                  <p className="text-sm text-slate-600 font-medium leading-relaxed pl-12">
                    {r.dosage}
                  </p>
                </div>

                {/* Metadata Footer bar */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 pl-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <PawPrint className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{r.petName}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 min-w-0">
                    <User className="size-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">Dr. {r.vetName}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 ml-auto md:ml-0">
                    <Calendar className="size-3.5 text-slate-400 shrink-0" />
                    <span>{new Date(r.issuedAt as string).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}