"use client";
import { useState } from "react";
import { TopBar } from "@/components/TopBar";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Plus, X } from "lucide-react";

const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
type DaySlots = Record<string, string[]>;
const initial: DaySlots = {
  Mon: ["09:00","11:00","17:00"], Tue: ["10:00","18:00"], Wed: ["09:00"],
  Thu: ["11:00","17:00"], Fri: ["09:00","11:00","18:00"], Sat: ["10:00"], Sun: [],
};

export default function SchedulePage() {
  const [schedule, setSchedule] = useState<DaySlots>(initial);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const add = (d: string) => {
    const t = draft[d]; if (!t) return;
    setSchedule(s => ({ ...s, [d]: [...new Set([...s[d], t])].sort() }));
    setDraft(x => ({ ...x, [d]: "" }));
  };
  const remove = (d: string, t: string) => setSchedule(s => ({ ...s, [d]: s[d].filter(x => x !== t) }));

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Weekly availability</h1>
            <p className="text-slate-600 mt-1">Add time slots clients can book.</p>
          </div>
          <Button>Save changes</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {days.map(d => (
            <Card key={d}><CardBody>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-slate-900">{d}</h3>
                <span className="text-xs text-slate-500">{schedule[d].length} slots</span>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                {schedule[d].map(t => (
                  <span key={t} className="inline-flex items-center gap-1 bg-brand-50 text-brand-700 px-3 py-1 rounded-full text-sm">
                    {t}
                    <button onClick={() => remove(d, t)} className="hover:text-rose-600"><X className="size-3.5" /></button>
                  </span>
                ))}
                {schedule[d].length === 0 && <span className="text-sm text-slate-400">Day off</span>}
              </div>

              <div className="flex gap-2">
                <input type="time" value={draft[d] ?? ""} onChange={e => setDraft(x => ({ ...x, [d]: e.target.value }))}
                  className="flex-1 h-10 px-3 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-brand-500" />
                <Button size="sm" onClick={() => add(d)}><Plus className="size-4" /> Add</Button>
              </div>
            </CardBody></Card>
          ))}
        </div>
      </main>
    </>
  );
}
