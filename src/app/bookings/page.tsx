import { TopBar } from "@/components/TopBar";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { bookings } from "@/lib/mock-data";
import { inr } from "@/lib/utils";

const toneFor = (s: string) =>
  s === "confirmed" ? "green" : s === "pending" ? "amber" : s === "completed" ? "slate" : "rose";

export default function BookingsPage() {
  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">My bookings</h1>
        <div className="space-y-3">
          {bookings.map(b => (
            <Card key={b.id}><CardBody className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{b.vetName}</p>
                <p className="text-sm text-slate-500">{b.petName} · {b.date} at {b.slot} · {b.mode}</p>
              </div>
              <div className="text-right space-y-1">
                <Badge tone={toneFor(b.status) as any}>{b.status}</Badge>
                <p className="text-sm font-semibold">{inr(b.fee)}</p>
              </div>
            </CardBody></Card>
          ))}
        </div>
      </main>
    </>
  );
}
