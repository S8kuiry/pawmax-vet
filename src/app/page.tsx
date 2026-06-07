import Link from "next/link";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/Button";
import { Card, CardBody } from "@/components/ui/Card";
import { Stethoscope, Video, Calendar, Shield, ArrowUpRight, PawPrint } from "lucide-react";
import { BgPawIcon } from "@/components/bgPawIcon";

export default function Home() {
  return (
    <>
      <TopBar />
      {/* Light High-Contrast Canvas Frame */}
      <main className="min-h-screen bg-[#F8FAFC] antialiased selection:bg-brand-500/20">
        
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl px-6 pt-24 pb-28 grid md:grid-cols-2 gap-12 items-center">
          {/* Floating Paw Decorations */}
          <BgPawIcon />



          <div className="space-y-6">
            
            {/* Tiny Micro-Badge Indicator */}
            <div>
              <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-brand-700 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-100">
                <Shield className="size-3 text-brand-600" /> Verified veterinarians
              </span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Online vet care, <br />
              <span className="text-brand-600 relative inline-block">
                in minutes.
                <span className="absolute left-0 bottom-1 w-full h-[4px] bg-brand-100 -z-10 rounded" />
              </span>
            </h1>

            <p className="text-slate-500 text-sm md:text-base font-medium max-w-md leading-relaxed">
              Video consult, chat or visit a clinic. Track records, vaccinations and prescriptions in one unified ecosystem.
            </p>

            {/* Premium CTA Buttons Block */}
            <div className="flex flex-wrap gap-3.5 pt-2">
              <Link href="/register">
                <Button size="lg" className="shadow-md shadow-brand-500/10 font-bold text-xs gap-1.5 group">
                  Book a consultation 
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </Link>
              <Link href="/vet-onboarding">
                <Button size="lg" variant="outline" className="font-bold text-xs bg-white hover:bg-slate-50 border-slate-200">
                  Join as a vet
                </Button>
              </Link>
            </div>
          </div>

          {/* Clean Vector Screen Component (Removed dark card cover container) */}
          <div className="relative flex justify-center w-full max-w-md mx-auto md:max-w-none">
            {/* Soft backdrop radial bloom accent */}
            <div className="absolute -inset-4 bg-brand-200/40 blur-3xl rounded-full opacity-60 pointer-events-none" />
            
            {/* Responsive Tablet Vector Image Frame */}
            <div className="relative w-full aspect-[4/3] rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 border border-slate-200/60 shadow-lg overflow-hidden group">
              {/* Grid backdrop structure matching image_9a7682.jpg layout */}
              <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:14px_14px]" />
              <div className="absolute inset-0 bg-black/[0.02]" />
              
              <Stethoscope className="absolute inset-0 m-auto size-20 text-white/90 transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3" />
            </div>
          </div>
        </section>

        {/* Feature Grid Section */}
        <section className="mx-auto max-w-7xl px-6 pb-32">
          {/* Section Section Label Meta Header */}
          <div className="mb-8 border-b border-slate-200/60 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-0.5">Platform Capabilities</span>
            <h2 className="text-sm font-bold text-slate-900">Why choose our remote clinical ecosystem</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              { icon: Video, t: "Video consults", d: "30-min HD video with instant automated digital prescriptions." },
              { icon: Calendar, t: "Flexible slots", d: "On-demand booking panels featuring same-day & late evening availability." },
              { icon: Shield, t: "Verified vets",  d: "Rigorous corporate background KYC + medical state license verified veterinarians." },
            ].map(f => (
              /* Individual Feature Items */
              <Card 
                key={f.t} 
                className="bg-white border border-slate-200/80 rounded-2xl p-2 shadow-sm transition-all duration-200 hover:border-slate-300/90 hover:shadow-md"
              >
                <CardBody className="p-4 space-y-4">
                  {/* Icon Badge Container */}
                  <div className="size-10 rounded-xl bg-slate-900 text-brand-400 grid place-items-center shadow-sm">
                    <f.icon className="size-4.5" />
                  </div>
                  
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 tracking-tight">{f.t}</h3>
                    <p className="text-slate-500 text-xs font-medium leading-relaxed">{f.d}</p>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </section>

      </main>
    </>
  );
}