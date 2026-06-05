import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Stethoscope, Syringe, Pill, NotebookPen, PawPrint, PawPrintIcon } from "lucide-react";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { EmptyState } from "@/components/owner/EmptyState";
import Pet from "@/models/Pet";
import MedicalRecord from "@/models/MedicalRecord";
import User from "@/models/User";
import { PageHeader } from "@/components/owner/PageHeader";

const typeMeta: Record<string, { icon: typeof Stethoscope; color: string; label: string }> = {
  soap: { icon: Stethoscope, color: "bg-blue-50 text-blue-600", label: "SOAP note" },
  vaccine: { icon: Syringe, color: "bg-emerald-50 text-emerald-600", label: "Vaccination" },
  lab: { icon: Pill, color: "bg-amber-50 text-amber-600", label: "Lab" },
  surgery: { icon: Stethoscope, color: "bg-rose-50 text-rose-600", label: "Surgery" },
  imaging: { icon: FileText, color: "bg-indigo-50 text-indigo-600", label: "Imaging" },
  note: { icon: NotebookPen, color: "bg-slate-50 text-slate-600", label: "Note" },
};

export default async function RecordsPage({
  searchParams,
}: {
  searchParams?: Promise<{ petId?: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "owner") redirect("/login");

  const sp = await searchParams;
  await dbConnect();

  const pets = await Pet.find({ ownerId: session.id }).select("_id name species breed").lean();
  const petIds = pets.map((p) => p._id);

  const filter: Record<string, unknown> = { ownerId: session.id, petId: { $in: petIds } };
  if (sp?.petId) filter.petId = sp.petId;

  const records = await MedicalRecord.find(filter).sort({ date: -1 }).lean();
  const vetIds = [...new Set(records.map((r) => String(r.vetId)))];
  const vets = await User.find({ _id: { $in: vetIds } }).select("name").lean();
  const vetMap = Object.fromEntries(vets.map((v) => [String(v._id), v.name]));
  const petMap = Object.fromEntries(pets.map((p) => [String(p._id), p.name]));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Medical Records"
        description="A complete timeline of every visit, vaccination, prescription and note for your pets."
      />

      {/* Top Filter Tabs */}
      {pets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/owner/records"
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              !sp?.petId
                ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
            }`}
          >
            All pets
          </Link>
          {pets.map((p) => (
            <Link
              key={String(p._id)}
              href={`/owner/records?petId=${p._id}`}
              className={`px-3 py-1.5 rounded-full text-sm border transition ${
                sp?.petId === String(p._id)
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
              }`}
            >
              {p.name as string}
            </Link>
          ))}
        </div>
      )}

      {/* Content Rendering Zone */}
      {records.length === 0 ? (
        // 🟢 IF NO RECORDS FOUND
        !sp?.petId ? (
          // Case A: User is viewing "All Pets" section -> Show Interactive Pet Selection Dashboard Grid
          <div className="space-y-4">
            <div className="bg-blue-50/50 border border-slate-200 rounded-2xl p-8 text-center max-w-7xl mx-auto">
              <div className="size-12 bg-white text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm shadow-blue-100">
                <PawPrint className="size-6" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Select a Pet Profile</h3>
              <p className="text-sm text-slate-500 mt-1 mb-8 max-w-md mx-auto">
                 Tap on an individual pet below to explore or update their unique records.
              </p>
              
              {/* Pet Cards Grid Layout */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                {pets.map((p) => (
                  <Link
                    key={String(p._id)}
                    href={`/owner/records?petId=${p._id}`}
                    className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md hover:-translate-y-0.5 transition duration-200 group"
                  >
                    <div className="size-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:bg-blue-100 transition shrink-0">
                    <PawPrintIcon className="size-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-medium text-slate-800 group-hover:text-blue-600 transition truncate">
                        {p.name as string}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">
                        {p.breed ? `${p.breed} (${p.species})` : (p.species as string)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          // Case B: User selected a single target pet tab with no records -> Show traditional EmptyState component
          <EmptyState
            icon={FileText}
            title={`No records found for ${petMap[sp.petId]}`}
            description="Medical history summaries uploaded by clinic vets during consultations will be listed here."
            ctaLabel="View All Pets"
            ctaHref="/owner/records"
          />
        )
      ) : (
        // 🟢 IF RECORDS EXIST -> Show Timeline Feed List
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 shadow-sm overflow-hidden">
          {records.map((r) => {
            const meta = typeMeta[r.type as string] ?? typeMeta.note;
            const Icon = meta.icon;
            return (
              <div key={String(r._id)} className="flex gap-4 p-5 hover:bg-slate-50/50 transition">
                <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                  <Icon className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      {meta.label}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500">
                      {new Date(r.date as Date).toLocaleDateString(undefined, {
                        day: "numeric", month: "short", year: "numeric",
                      })}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-blue-600 bg-blue-50/70 px-2 py-0.5 rounded-full">
                      {petMap[String(r.petId)]}
                    </span>
                  </div>
                  <h3 className="font-medium text-slate-900 mt-0.5">{r.summary || "Medical record"}</h3>
                  {r.body && (
                    <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-wrap leading-relaxed">{r.body as string}</p>
                  )}
                  {vetMap[String(r.vetId)] && (
                    <p className="text-xs text-slate-400 mt-2.5 italic">
                      Recorded by Dr. {vetMap[String(r.vetId)]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}