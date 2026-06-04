export default function Page() {
    return (
      <div className="px-10 py-10 max-w-3xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Bookings</p>
          <h1 className="text-3xl font-semibold">New booking</h1>
          <p className="mt-2 text-slate-500">Manually add a walk-in or phone-booked appointment.</p>
        </div>
  
        <form className="space-y-5 rounded-2xl bg-white border border-slate-200 p-6">
          {[
            ["Pet name", "e.g. Bruno"],
            ["Owner name", "e.g. Priya Shah"],
            ["Phone", "+91…"],
          ].map(([label, ph]) => (
            <div key={label}>
              <label className="block text-sm font-medium mb-1.5">{label}</label>
              <input className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder={ph} />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Date</label>
              <input type="date" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Time</label>
              <input type="time" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <button className="rounded-lg bg-slate-900 text-white px-5 py-2.5 text-sm font-medium">
            Create booking
          </button>
        </form>
      </div>
    );
  }
  