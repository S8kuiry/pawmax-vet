"use client";
import { useState } from "react";
import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { vets } from "@/lib/mock-data";
import { inr } from "@/lib/utils";
import { Search, Star } from "lucide-react";

const specialties = ["All", "General + Dermatology", "Surgery + Orthopedics", "Nutrition + Behaviour", "Exotics + Avian"];

export default function VetsPage() {
  const [q, setQ] = useState("");
  const [spec, setSpec] = useState("All");

  const filtered = vets.filter(v =>
    (spec === "All" || v.specialty === spec) &&
    (v.name.toLowerCase().includes(q.toLowerCase()) || v.city.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <TopBar />
      <main className="mx-auto max-w-7xl px-6 py-10 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Find a veterinarian</h1>
          <p className="text-slate-600 mt-1">Verified vets across India · video, chat or clinic.</p>
        </div>

        <Card><CardBody className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <Input className="pl-10" placeholder="Search by name or city" value={q} onChange={e => setQ(e.target.value)} />
          </div>
          <div className="flex flex-wrap gap-2">
            {specialties.map(s => (
              <button key={s} onClick={() => setSpec(s)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium ${spec === s ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
                {s}
              </button>
            ))}
          </div>
        </CardBody></Card>

        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map(v => (
            <Card key={v.id}><CardBody>
              <div className="flex gap-4">
                <span className="size-16 rounded-2xl grid place-items-center text-xl font-bold text-white"
                      style={{ backgroundColor: v.avatarColor }}>{v.name.split(" ")[1][0]}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">{v.name}</h3>
                    <span className="flex items-center gap-1 text-sm text-amber-600"><Star className="size-4 fill-amber-500 stroke-amber-500" />{v.rating}</span>
                  </div>
                  <p className="text-sm text-slate-600">{v.specialty} · {v.experience}y</p>
                  <p className="text-xs text-slate-500 mt-1">{v.city} · {v.languages.join(", ")}</p>
                  <div className="flex gap-1.5 mt-2">{v.modes.map(m => <Badge key={m} tone="blue">{m}</Badge>)}</div>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <span className="font-semibold text-slate-900">{inr(v.fee)}<span className="text-xs text-slate-500 font-normal"> /consult</span></span>
                <Link href={`/vets/${v.id}/book`}><Button>Book now</Button></Link>
              </div>
            </CardBody></Card>
          ))}
        </div>
      </main>
    </>
  );
}
