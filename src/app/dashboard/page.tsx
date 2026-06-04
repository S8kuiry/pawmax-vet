import { TopBar } from "@/components/TopBar";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { bookings, pets } from "@/lib/mock-data";
import { Calendar, PawPrint, Stethoscope, Video } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  const upcoming = bookings.filter(b => b.status !== "completed" && b.status !== "cancelled");

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-widest text-brand-700">Owner</p>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, Hannah</h1>
          </div>
          <Link href="/vets"><Button>Book a consult</Button></Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Calendar, label: "Upcoming", v: upcoming.length },
            { icon: PawPrint, label: "Pets", v: pets.length },
            { icon: Stethoscope, label: "Past consults", v: 8 },
            { icon: Video, label: "Video minutes", v: 240 },
          ].map(s => (
            <Card key={s.label}><CardBody className="flex items-center gap-4">
              <span className="size-11 rounded-xl bg-brand-50 text-brand-700 grid place-items-center"><s.icon className="size-5" /></span>
              <div>
                <p className="text-2xl font-bold text-slate-900">{s.v}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            </CardBody></Card>
          ))}
        </div>

        <Card><CardBody>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Upcoming consultations</h2>
            <Link href="/bookings" className="text-sm text-brand-700">View all</Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {upcoming.map(b => (
              <li key={b.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">{b.vetName} · {b.petName}</p>
                  <p className="text-sm text-slate-500">{b.date} at {b.slot} · {b.mode}</p>
                </div>
                <Badge tone={b.status === "confirmed" ? "green" : "amber"}>{b.status}</Badge>
              </li>
            ))}
          </ul>
        </CardBody></Card>

        <Card><CardBody>
          <h2 className="font-semibold text-slate-900 mb-4">Your pets</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {pets.map(p => (
              <div key={p.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100">
                <span className="size-12 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-semibold">{p.name[0]}</span>
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-sm text-slate-500">{p.breed} · {p.age}y · {p.weightKg}kg</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody></Card>
      </main>
    </>
  );
}
