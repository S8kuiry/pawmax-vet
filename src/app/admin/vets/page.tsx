"use client";
import { useEffect, useState } from "react";
import { CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export default function AdminVets() {
  const [vets, setVets] = useState<any[]>([]);
  const load = async () => setVets((await (await fetch("/api/admin/vets")).json()).vets || []);
  useEffect(() => { load(); }, []);

  const decide = async (id: string, decision: "approved" | "rejected") => {
    const reason = decision === "rejected" ? prompt("Reason?") || "" : undefined;
    await fetch(`/api/admin/vets/${id}/approve`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ decision, reason }),
    });
    load();
  };

  const badge = (s: string) => ({
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
    verified: "bg-emerald-50 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-50 text-rose-700 border-rose-200",
  } as any)[s] || "bg-slate-50 text-slate-600 border-slate-200";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center gap-2 mb-6 text-brand-900">
        <ShieldCheck className="size-5" />
        <h1 className="text-2xl font-semibold">Vet KYC approvals</h1>
      </div>
      <div className="bg-white border border-brand-100 rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-brand-800">
            <tr>
              <th className="text-left px-4 py-3">Name</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">License</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {vets.map(v => (
              <tr key={v._id} className="border-t border-brand-100">
                <td className="px-4 py-3 font-medium text-brand-900">{v.name}</td>
                <td className="px-4 py-3 text-slate-600">{v.email}</td>
                <td className="px-4 py-3 text-slate-600">{v.licenseNumber || "—"}</td>
                <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full border text-xs ${badge(v.kycStatus)}`}>{v.kycStatus}</span></td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => decide(v._id, "approved")} className="inline-flex items-center gap-1 text-emerald-700 hover:bg-emerald-50 px-2 py-1 rounded mr-1">
                    <CheckCircle2 className="size-4" /> Approve
                  </button>
                  <button onClick={() => decide(v._id, "rejected")} className="inline-flex items-center gap-1 text-rose-700 hover:bg-rose-50 px-2 py-1 rounded">
                    <XCircle className="size-4" /> Reject
                  </button>
                </td>
              </tr>
            ))}
            {!vets.length && <tr><td colSpan={5} className="text-center text-slate-500 py-10">No vets yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
