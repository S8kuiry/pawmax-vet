import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Stethoscope, Video, Calendar, Shield } from "lucide-react";

export default function Home() {
  return (
    <>
      <TopBar />
      <main>
        <section className="mx-auto max-w-7xl px-6 pt-20 pb-24 grid md:grid-cols-2 gap-12 items-center ">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-medium text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full">
              <Shield className="size-3.5" /> Verified veterinarians
            </span>
            <h1 className="mt-4 text-5xl font-bold text-slate-900 leading-tight">
              Online vet care, <span className="text-brand-600">in minutes.</span>
            </h1>
            <p className="mt-4 text-slate-600 text-lg max-w-md">
              Video consult, chat or visit a clinic. Track records, vaccinations and prescriptions in one place.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/register"><Button size="lg">Book a consultation</Button></Link>
              <Link href="/vet-onboarding"><Button size="lg" variant="outline">Join as a vet</Button></Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-brand-100/60 blur-3xl rounded-full" />
            <Card className="relative p-2">
              <div className="aspect-[4/3] rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 grid place-items-center text-white">
                <Stethoscope className="size-24 opacity-80" />
              </div>
            </Card>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-24 grid md:grid-cols-3 gap-6">
          {[
            { icon: Video, t: "Video consults", d: "30-min HD video with prescriptions." },
            { icon: Calendar, t: "Flexible slots", d: "Same-day & evening availability." },
            { icon: Shield, t: "Verified vets",  d: "KYC + license-verified veterinarians." },
          ].map(f => (
            <Card key={f.t}><CardBody>
              <div className="size-11 rounded-xl bg-brand-50 text-brand-700 grid place-items-center mb-4">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold text-slate-900">{f.t}</h3>
              <p className="text-slate-600 text-sm mt-1">{f.d}</p>
            </CardBody></Card>
          ))}
        </section>
      </main>
    </>
  );
}
