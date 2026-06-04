import { FileText, Syringe, Pill, Stethoscope } from "lucide-react";

const ICONS = {
  visit: Stethoscope, vaccination: Syringe, prescription: Pill, note: FileText,
} as const;

type Record = {
  _id: string; type: keyof typeof ICONS;
  title: string; description?: string;
  date: string; vetName?: string;
};

export function MedicalTimeline({ records }: { records: Record[] }) {
  if (!records.length) {
    return <p className="text-sm text-slate-500 italic">No medical history yet.</p>;
  }
  return (
    <ol className="relative border-l-2 border-blue-100 ml-3 space-y-6">
      {records.map((r) => {
        const Icon = ICONS[r.type] ?? FileText;
        return (
          <li key={r._id} className="ml-6">
            <span className="absolute -left-[13px] size-6 rounded-full bg-white border-2 border-blue-200 grid place-items-center text-blue-600">
              <Icon className="size-3" />
            </span>
            <div className="rounded-lg border border-blue-100 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-slate-800">{r.title}</p>
                <span className="text-xs text-slate-500">
                  {new Date(r.date).toLocaleDateString()}
                </span>
              </div>
              {r.description && <p className="mt-1 text-sm text-slate-600">{r.description}</p>}
              {r.vetName && <p className="mt-2 text-xs text-slate-400">— Dr. {r.vetName}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
