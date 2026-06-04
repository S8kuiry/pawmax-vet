import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Prescription from "@/models/Prescription";
import Pet from "@/models/Pet";

export default async function VetPrescriptionsPage() {
  const session = await getSession();
  await dbConnect();
  const items = await Prescription.find({ vetId: session!.id })
    .sort({ issuedAt: -1 })
    .limit(50)
    .lean();
  const petIds = [...new Set(items.map((r) => String(r.petId)))];
  const pets = await Pet.find({ _id: { $in: petIds } }).select("name").lean();
  const petMap = Object.fromEntries(pets.map((p) => [String(p._id), p.name]));

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Clinical</p>
        <h1 className="text-3xl font-semibold">Prescriptions</h1>
        <p className="mt-2 text-slate-500">Active and completed prescriptions you have issued.</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No prescriptions yet.</p>
      ) : (
        <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="text-left px-5 py-3">Pet</th>
                <th className="text-left px-5 py-3">Medication</th>
                <th className="text-left px-5 py-3">Date</th>
                <th className="text-left px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((r) => (
                <tr key={String(r._id)}>
                  <td className="px-5 py-4 font-medium">{petMap[String(r.petId)]}</td>
                  <td className="px-5 py-4">{r.drug} {r.strength}</td>
                  <td className="px-5 py-4 text-slate-600">{new Date(r.issuedAt as Date).toLocaleDateString()}</td>
                  <td className="px-5 py-4 capitalize">{r.status as string}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
