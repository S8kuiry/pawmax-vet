"use client";
import { useEffect, useState } from "react";
import { Wallet, Plus } from "lucide-react";

const inr = (n: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(n || 0);

export default function PayoutsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ vetId: "", periodStart: "", periodEnd: "" });

  const load = async () => setItems((await (await fetch("/api/admin/payouts")).json()).payouts || []);
  useEffect(() => { load(); }, []);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/admin/payouts", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vetId: form.vetId,
        periodStart: new Date(form.periodStart).toISOString(),
        periodEnd: new Date(form.periodEnd).toISOString(),
      }),
    });
    if (res.ok) { setOpen(false); load(); } else alert((await res.json()).error || "Failed");
  };

  const markPaid = async (id: string) => {
    const razorpayPayoutId = prompt("Razorpay payout ID");
    if (!razorpayPayoutId) return;
    await fetch(`/api/admin/payouts/${id}/mark-paid`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ razorpayPayoutId }),
    });
    load();
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 text-brand-900">
          <Wallet className="size-5" />
          <h1 className="text-2xl font-semibold">Vet payouts</h1>
        </div>
        <button onClick={() => setOpen(true)} className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl shadow-card">
          <Plus className="size-4" /> New payout
        </button>
      </div>

      <div className="bg-white border border-brand-100 rounded-2xl shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-brand-50 text-brand-800">
            <tr>
              <th className="text-left px-4 py-3">Vet</th>
              <th className="text-left px-4 py-3">Period</th>
              <th className="text-right px-4 py-3">Gross</th>
              <th className="text-right px-4 py-3">Fee</th>
              <th className="text-right px-4 py-3">GST</th>
              <th className="text-right px-4 py-3">Net</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-right px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map(p => (
              <tr key={p._id} className="border-t border-brand-100">
                <td className="px-4 py-3 font-medium text-brand-900">{p.vetId?.name || p.vetId}</td>
                <td className="px-4 py-3 text-slate-600">{new Date(p.periodStart).toLocaleDateString()} → {new Date(p.periodEnd).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-right">{inr(p.grossAmount)}</td>
                <td className="px-4 py-3 text-right">{inr(p.platformFee)}</td>
                <td className="px-4 py-3 text-right">{inr(p.gst)}</td>
                <td className="px-4 py-3 text-right font-medium text-brand-900">{inr(p.netAmount)}</td>
                <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full border text-xs bg-brand-50 text-brand-700 border-brand-200">{p.status}</span></td>
                <td className="px-4 py-3 text-right">
                  {p.status !== "paid" && (
                    <button onClick={() => markPaid(p._id)} className="text-brand-700 hover:bg-brand-50 px-2 py-1 rounded">Mark paid</button>
                  )}
                </td>
              </tr>
            ))}
            {!items.length && <tr><td colSpan={8} className="text-center text-slate-500 py-10">No payouts yet.</td></tr>}
          </tbody>
        </table>
      </div>

      {open && (
        <div className="fixed inset-0 bg-brand-950/40 grid place-items-center p-4 z-50">
          <form onSubmit={create} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-brand-100 space-y-3">
            <h2 className="text-lg font-semibold text-brand-900">New payout</h2>
            <input className="w-full border border-brand-200 rounded-lg px-3 py-2" placeholder="Vet ID"
              value={form.vetId} onChange={e => setForm({ ...form, vetId: e.target.value })} required />
            <div className="grid grid-cols-2 gap-2">
              <input type="date" className="border border-brand-200 rounded-lg px-3 py-2"
                value={form.periodStart} onChange={e => setForm({ ...form, periodStart: e.target.value })} required />
              <input type="date" className="border border-brand-200 rounded-lg px-3 py-2"
                value={form.periodEnd} onChange={e => setForm({ ...form, periodEnd: e.target.value })} required />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-4 py-2 rounded-lg border border-brand-200">Cancel</button>
              <button className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
