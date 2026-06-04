"use client";
import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { bookings, type Booking } from "@/lib/mock-data";
import { inr, cn } from "@/lib/utils";

const tabs: { key: Booking["status"]; label: string }[] = [
  { key: "pending",   label: "Pending"   },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
];

export default function VetBookings() {
  const [tab, setTab] = useState<Booking["status"]>("pending");
  const list = bookings.filter(b => b.status === tab);

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>

        <div className="flex gap-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium",
                tab === t.key ? "bg-brand-600 text-white" : "bg-white border border-slate-200 text-slate-700 hover:border-brand-400")}>
              {t.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {list.map(b => (
            <Card key={b.id}><CardBody className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-slate-900">{b.petName} · {b.mode}</p>
                <p className="text-sm text-slate-500">{b.date} at {b.slot}</p>
              </div>
              <div className="flex items-center gap-3">
                <Badge tone={b.status === "confirmed" ? "green" : b.status === "pending" ? "amber" : "slate"}>{b.status}</Badge>
                <span className="text-sm font-semibold">{inr(b.fee)}</span>
                {b.status === "pending" && (
                  <>
                    <Button size="sm" variant="outline">Decline</Button>
                    <Button size="sm">Accept</Button>
                  </>
                )}
                {b.status === "confirmed" && <Button size="sm">Join call</Button>}
              </div>
            </CardBody></Card>
          ))}
          {list.length === 0 && (
            <Card><CardBody className="text-center text-slate-500 py-10">No bookings in this tab.</CardBody></Card>
          )}
        </div>
      </main>
    </>
  );
}
