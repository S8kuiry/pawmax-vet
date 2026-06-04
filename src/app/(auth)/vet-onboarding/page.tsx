"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardBody } from "@/components/ui/Card";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const steps = ["Account", "Professional", "KYC & Bank", "Review"];

export default function VetOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [data, setData] = useState({
    name: "", email: "", phone: "", password: "",
    license: "", experience: "", specialty: "", city: "", bio: "",
    pan: "", aadhaar: "", ifsc: "", account: "",
  });
  const set = (k: keyof typeof data, v: string) => setData(d => ({ ...d, [k]: v }));

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-5xl px-6 h-16 flex items-center justify-between">
          <Logo />
          <span className="text-sm text-slate-500">Vet onboarding</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <ol className="flex items-center gap-2 mb-8">
          {steps.map((s, i) => (
            <li key={s} className="flex-1 flex items-center gap-2">
              <span className={cn(
                "size-8 rounded-full grid place-items-center text-sm font-semibold",
                i < step ? "bg-brand-600 text-white" :
                i === step ? "bg-brand-100 text-brand-700 ring-2 ring-brand-300" :
                "bg-slate-200 text-slate-500"
              )}>
                {i < step ? <Check className="size-4" /> : i + 1}
              </span>
              <span className={cn("text-sm font-medium", i === step ? "text-slate-900" : "text-slate-500")}>{s}</span>
              {i < steps.length - 1 && <span className="flex-1 h-px bg-slate-200" />}
            </li>
          ))}
        </ol>

        <Card><CardBody className="space-y-5">
          {step === 0 && (
            <>
              <h2 className="text-xl font-semibold text-slate-900">Account details</h2>
              <Input placeholder="Full name" value={data.name} onChange={e => set("name", e.target.value)} />
              <Input type="email" placeholder="Email" value={data.email} onChange={e => set("email", e.target.value)} />
              <Input type="tel" placeholder="Phone" value={data.phone} onChange={e => set("phone", e.target.value)} />
              <Input type="password" placeholder="Create password" value={data.password} onChange={e => set("password", e.target.value)} />
            </>
          )}
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold text-slate-900">Professional info</h2>
              <Input placeholder="License number (VCI / state council)" value={data.license} onChange={e => set("license", e.target.value)} />
              <Input placeholder="Years of experience" value={data.experience} onChange={e => set("experience", e.target.value)} />
              <Input placeholder="Specialty (e.g. Dermatology)" value={data.specialty} onChange={e => set("specialty", e.target.value)} />
              <Input placeholder="City" value={data.city} onChange={e => set("city", e.target.value)} />
              <textarea
                className="w-full min-h-28 rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                placeholder="Short bio for your profile"
                value={data.bio} onChange={e => set("bio", e.target.value)}
              />
            </>
          )}
          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold text-slate-900">KYC & bank</h2>
              <Input placeholder="PAN" value={data.pan} onChange={e => set("pan", e.target.value)} />
              <Input placeholder="Aadhaar (last 4 digits)" value={data.aadhaar} onChange={e => set("aadhaar", e.target.value)} />
              <Input placeholder="IFSC" value={data.ifsc} onChange={e => set("ifsc", e.target.value)} />
              <Input placeholder="Account number" value={data.account} onChange={e => set("account", e.target.value)} />
            </>
          )}
          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold text-slate-900">Review</h2>
              <dl className="grid grid-cols-2 gap-y-2 text-sm">
                {Object.entries(data).map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-slate-500 capitalize">{k}</dt>
                    <dd className="text-slate-900">{v || "—"}</dd>
                  </div>
                ))}
              </dl>
              <p className="text-xs text-slate-500">By submitting you agree to verification within 48 hours.</p>
            </>
          )}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(s => s - 1)}>Back</Button>
            {step < steps.length - 1 ? (
              <Button onClick={() => setStep(s => s + 1)}>Continue</Button>
            ) : (
              <Button onClick={() => router.push("/vet/dashboard")}>Submit application</Button>
            )}
          </div>
        </CardBody></Card>
      </main>
    </div>
  );
}
