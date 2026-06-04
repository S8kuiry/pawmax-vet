"use client";
import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TopBar } from "@/components/TopBar";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { pets, slots, vets, type ConsultMode } from "@/lib/mock-data";
import { inr, cn } from "@/lib/utils";
import { Check, MessageSquare, Stethoscope, Video } from "lucide-react";

const modeMeta: Record<ConsultMode, { icon: typeof Video; label: string; sub: string }> = {
  video:  { icon: Video,         label: "Video call",  sub: "30 min HD video" },
  chat:   { icon: MessageSquare, label: "Chat",        sub: "24h chat thread" },
  clinic: { icon: Stethoscope,   label: "Clinic visit",sub: "In-person at clinic" },
};

export default function BookPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const vet = useMemo(() => vets.find(v => v.id === id), [id]);
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<ConsultMode>("video");
  const [petId, setPetId] = useState(pets[0]?.id ?? "");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [slot, setSlot] = useState<string | null>(null);

  if (!vet) return <main className="p-10">Vet not found.</main>;

  const gst = Math.round(vet.fee * 0.18);
  const total = vet.fee + gst;

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <div className="flex items-center gap-4 mb-8">
          <span className="size-14 rounded-2xl grid place-items-center text-lg font-bold text-white" style={{ backgroundColor: vet.avatarColor }}>
            {vet.name.split(" ")[1][0]}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{vet.name}</h1>
            <p className="text-slate-600 text-sm">{vet.specialty} · {vet.city}</p>
          </div>
        </div>

        <ol className="flex gap-2 mb-6">
          {["Mode", "Pet", "Slot", "Payment"].map((s, i) => (
            <li key={s} className="flex-1">
              <div className={cn("h-1.5 rounded-full", i <= step ? "bg-brand-600" : "bg-slate-200")} />
              <p className={cn("text-xs mt-2", i === step ? "text-slate-900 font-medium" : "text-slate-500")}>{s}</p>
            </li>
          ))}
        </ol>

        <Card><CardBody className="space-y-5">
          {step === 0 && (
            <div className="grid sm:grid-cols-3 gap-3">
              {vet.modes.map(m => {
                const M = modeMeta[m]; const active = mode === m;
                return (
                  <button key={m} onClick={() => setMode(m)}
                    className={cn("p-5 rounded-xl border text-left transition",
                      active ? "border-brand-500 bg-brand-50" : "border-slate-200 hover:border-brand-300")}>
                    <M.icon className="size-5 text-brand-700" />
                    <p className="mt-2 font-medium text-slate-900">{M.label}</p>
                    <p className="text-xs text-slate-500">{M.sub}</p>
                  </button>
                );
              })}
            </div>
          )}
          {step === 1 && (
            <div className="space-y-2">
              {pets.map(p => (
                <button key={p.id} onClick={() => setPetId(p.id)}
                  className={cn("w-full flex items-center justify-between p-4 rounded-xl border",
                    petId === p.id ? "border-brand-500 bg-brand-50" : "border-slate-200")}>
                  <div className="flex items-center gap-3">
                    <span className="size-10 rounded-full bg-brand-100 text-brand-700 grid place-items-center font-semibold">{p.name[0]}</span>
                    <div className="text-left">
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-slate-500">{p.breed} · {p.age}y</p>
                    </div>
                  </div>
                  {petId === p.id && <Check className="size-5 text-brand-600" />}
                </button>
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <input type="date" value={date} onChange={e => setDate(e.target.value)}
                className="h-11 px-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-500" />
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {slots.map(s => (
                  <button key={s} onClick={() => setSlot(s)}
                    className={cn("py-2.5 rounded-lg text-sm font-medium border",
                      slot === s ? "bg-brand-600 text-white border-brand-600" : "border-slate-200 hover:border-brand-400")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3 text-sm">
              <Row k="Vet"  v={vet.name} />
              <Row k="Pet"  v={pets.find(p => p.id === petId)?.name ?? "—"} />
              <Row k="Mode" v={<Badge tone="blue">{mode}</Badge>} />
              <Row k="When" v={`${date} · ${slot ?? "—"}`} />
              <hr className="border-slate-100" />
              <Row k="Consultation" v={inr(vet.fee)} />
              <Row k="GST (18%)"    v={inr(gst)} />
              <Row k={<span className="font-semibold">Total</span>} v={<span className="font-bold text-slate-900">{inr(total)}</span>} />
            </div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
            {step < 3 ? (
              <Button onClick={() => setStep(s => s + 1)} disabled={step === 2 && !slot}>Continue</Button>
            ) : (
              <Button onClick={() => router.push("/bookings")}>Pay {inr(total)}</Button>
            )}
          </div>
        </CardBody></Card>
      </main>
    </>
  );
}

function Row({ k, v }: { k: React.ReactNode; v: React.ReactNode }) {
  return <div className="flex justify-between"><span className="text-slate-600">{k}</span><span>{v}</span></div>;
}
