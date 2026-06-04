export default function Page() {
  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Clinical</p>
          <h1 className="text-3xl font-semibold">Prescriptions</h1>
          <p className="mt-2 text-slate-500">E-prescriptions issued to your patients.</p>
        </div>
        <button className="rounded-lg bg-slate-900 text-white px-4 py-2 text-sm">New prescription</button>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
            <tr><th className="text-left px-5 py-3">Patient</th><th className="text-left px-5 py-3">Medication</th><th className="text-left px-5 py-3">Issued</th><th className="text-left px-5 py-3">Status</th></tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {[
              { pet: "Bruno", med: "Amoxicillin 250mg", date: "12 Mar", status: "Active" },
              { pet: "Mia", med: "Apoquel 5.4mg", date: "08 Mar", status: "Completed" },
            ].map((r, i) => (
              <tr key={i}>
                <td className="px-5 py-4 font-medium">{r.pet}</td>
                <td className="px-5 py-4 text-slate-600">{r.med}</td>
                <td className="px-5 py-4 text-slate-600">{r.date}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    r.status === "Active" ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                  }`}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
