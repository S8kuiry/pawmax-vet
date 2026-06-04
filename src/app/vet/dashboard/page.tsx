import { TopBar } from "@/components/TopBar";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { bookings } from "@/lib/mock-data";
import { inr } from "@/lib/utils";
import { CalendarCheck, IndianRupee, Star, Users } from "lucide-react";

export default function VetDashboard() {
  const today = bookings.filter(b => b.status !== "completed");
  const earnings = bookings.filter(b => b.status === "completed").reduce((s, b) => s + b.fee, 0);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <div>
          <p className="text-xs uppercase tracking-widest text-brand-700">Veterinarian</p>
          <h1 className="text-3xl font-bold text-slate-900">Good morning, Dr. Aanya</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: CalendarCheck, l: "Today's queue", v: today.length },
            { icon: Users,        l: "Active patients", v: 42 },
            { icon: Star,         l: "Rating",          v: "4.9" },
            { icon: IndianRupee,  l: "Week earnings",   v: inr(earnings + 9800) },
          ].map(s => (
            <Card key={s.l}><CardBody className="flex items-center gap-4">
              <span className="size-11 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><s.icon className="size-5" /></span>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.v}</p>
                <p className="text-xs text-slate-500">{s.l}</p>
              </div>
            </CardBody></Card>
          ))}
        </div>

        <Card><CardBody>
          <h2 className="font-semibold text-slate-900 mb-4">Today's consultations</h2>
          <ul className="divide-y divide-slate-100">
            {today.map(b => (
              <li key={b.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium">{b.petName} <span className="text-slate-400">·</span> {b.mode}</p>
                  <p className="text-sm text-slate-500">{b.date} at {b.slot}</p>
                </div>
                <Badge tone={b.status === "confirmed" ? "green" : "amber"}>{b.status}</Badge>
              </li>
            ))}
          </ul>
        </CardBody></Card>
      </main>
    </>
  );
}
