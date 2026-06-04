import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Stethoscope, Syringe, Pill, NotebookPen } from "lucide-react";
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

  const pets = await Pet.find({ ownerId: session.id }).select("_id name species").lean();
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

      {pets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Link
            href="/owner/records"
            className={`px-3 py-1.5 rounded-full text-sm border transition ${
              !sp?.petId
                ? "bg-blue-600 text-white border-blue-600"
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
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-slate-700 border-slate-200 hover:border-blue-300"
              }`}
            >
              {p.name as string}
            </Link>
          ))}
        </div>
      )}

      {records.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No medical records yet"
          description="Records added by your vet during consultations will appear here."
          ctaLabel="Book a vet"
          ctaHref="/owner/vets"
        />
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {records.map((r) => {
            const meta = typeMeta[r.type as string] ?? typeMeta.note;
            const Icon = meta.icon;
            return (
              <div key={String(r._id)} className="flex gap-4 p-5">
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
                    <span className="text-xs font-medium text-blue-600">
                      {petMap[String(r.petId)]}
                    </span>
                  </div>
                  <h3 className="font-medium text-slate-900">{r.summary || "Medical record"}</h3>
                  {r.body && (
                    <p className="text-sm text-slate-600 mt-1 whitespace-pre-wrap">{r.body as string}</p>
                  )}
                  {vetMap[String(r.vetId)] && (
                    <p className="text-xs text-slate-500 mt-2">
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
