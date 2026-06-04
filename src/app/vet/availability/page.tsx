import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Availability from "@/models/Availability";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function VetAvailabilityPage() {
  const session = await getSession();
  await dbConnect();
  const doc = await Availability.findOne({ vetId: session!.id }).lean();
  const weekly = (doc?.weeklyHours as { day: number; open: boolean; start: string; end: string }[]) || [];

  return (
    <div className="px-10 py-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Practice</p>
        <h1 className="text-3xl font-semibold">Availability</h1>
        <p className="mt-2 text-slate-500">
          Weekly hours shown here. Update via API <code className="text-xs bg-slate-100 px-1 rounded">PUT /api/vet/availability</code>.
        </p>
      </div>

      {!doc || weekly.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          No availability configured yet. Default slot length: 30 minutes.
        </div>
      ) : (
        <ul className="space-y-2">
          {weekly.map((d) => (
            <li key={d.day} className="rounded-xl bg-white border border-slate-200 px-5 py-3 flex justify-between text-sm">
              <span className="font-medium">{DAY_NAMES[d.day]}</span>
              <span className="text-slate-600">
                {d.open ? `${d.start} – ${d.end}` : "Closed"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
