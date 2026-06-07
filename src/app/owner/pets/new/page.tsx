"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { ArrowLeft, Check } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(1).max(50),
  species: z.enum(["Dog", "Cat", "Rabbit", "Bird", "Reptile", "Other"]),
  breed: z.string().trim().max(50).optional(),
  dob: z.string().optional(),
  weightKg: z.coerce.number().min(0).max(200).optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
});

const BREEDS_MAP: Record<string, string[]> = {
  Dog: ["Labrador Retriever", "German Shepherd", "Golden Retriever", "French Bulldog", "Beagle", "Poodle", "Rottweiler", "Boxer", "Shih Tzu", "Dachshund", "Mixed Breed"],
  Cat: ["Persian", "Maine Coon", "Ragdoll", "Siamese", "British Shorthair", "Abyssinian", "Sphynx", "Bengal", "Domestic Shorthair", "Mixed Breed"],
  Rabbit: ["Netherland Dwarf", "Holland Lop", "Mini Rex", "Flemish Giant", "Lionhead", "Angora"],
  Bird: ["Budgerigar (Parakeet)", "Cockatiel", "Lovebird", "Canary", "Finches", "African Grey"],
  Reptile: ["Bearded Dragon", "Leopard Gecko", "Ball Python", "Corn Snake", "Red-Eared Slider"],
};

export default function NewPetPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [selectedSpecies, setSelectedSpecies] = useState<string>("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const parsed = schema.safeParse(Object.fromEntries(fd));
    
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    
    setLoading(true);
    const { dob, gender, ...rest } = parsed.data;
    
    const res = await fetch("/api/pets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...rest,
        sex: gender,
        birthDate: dob || undefined,
      }),
    });
    
    setLoading(false);
    
    if (!res.ok) { 
      setError("Failed to create pet record inside database matrix"); 
      return; 
    }
    
    router.push("/owner/pets");
    router.refresh();
  }

  const availableBreeds = BREEDS_MAP[selectedSpecies] || [];
  const hasBreedOptions = availableBreeds.length > 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 w-full py-10 px-6 md:px-8 lg:px-12 antialiased flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        
        {/* Navigation Breadcrumb & Header Segment */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block mb-1">
            Data Core / Ingestion
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Add a New Pet
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Register new physiological configurations, species variants, and baseline metrics inside the logging core.
          </p>
        </div>

        {/* Form Container */}
        <form onSubmit={onSubmit} className="bg-white border border-slate-200/80 rounded-2xl p-6 space-y-5 shadow-sm">
          
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-[11px] font-bold rounded-lg">
              {error}
            </div>
          )}

          <Field 
            label="Pet Name" 
            name="name" 
            required 
            placeholder="Enter identity label..."
          />
          
          {/* Dynamic Taxonomy Dual Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select 
              label="Species System" 
              name="species" 
              required 
              options={["Dog","Cat","Rabbit","Bird","Reptile","Other"]} 
              value={selectedSpecies}
              onChange={(e) => setSelectedSpecies(e.target.value)}
            />

            {/* Dynamic Context Breed Renderer */}
            {selectedSpecies === "Other" || (!hasBreedOptions && selectedSpecies !== "") ? (
              <Field 
                label="Breed Taxonomy" 
                name="breed" 
                placeholder="Specify exact variant details..." 
              />
            ) : (
              <Select 
                label="Breed Variant" 
                name="breed" 
                disabled={!selectedSpecies} 
                defaultText={selectedSpecies ? "Select breed…" : "Select species configuration first…"}
                options={availableBreeds} 
              />
            )}
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field 
              label="Date of Birth" 
              name="dob" 
              type="date" 
            />
            
            <Field 
              label="Weight Mass Metric (kg)" 
              name="weightKg" 
              type="number" 
              step="0.1" 
              placeholder="0.0"
            />
          </div>
          
          <Select 
            label="Gender Designation" 
            name="gender" 
            options={["male","female","unknown"]} 
          />

          {/* Action Toolbar */}
          <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
            <button 
              type="submit" 
              disabled={loading} 
              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-3 text-xs font-bold transition shadow-md"
            >
              {loading ? "Ingesting Record…" : <><Check className="size-3.5" /> Add Pet</>}
            </button>
            
            <button 
              type="button" 
              onClick={() => router.back()} 
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 px-4 py-3 text-xs font-bold transition"
            >
              <ArrowLeft className="size-3.5" /> Cancel
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* 🎨 Modern Dark-Card Input Sub-Components matching Edit Implementation */
function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}{p.required && " *"}</span>
      <input 
        {...p} 
        className="w-full text-xs font-medium px-3.5 py-4 bg-[#0f172a] border border-blue-950/40 rounded-lg text-white outline-none focus:ring-1 focus:ring-blue-500/80 focus:border-blue-500/80 transition-all placeholder-slate-500 disabled:bg-slate-100 disabled:text-slate-400 [color-scheme:dark]" 
      />
    </label>
  );
}

function Select({ label, options, defaultText = "Select…", ...p }: { label: string; options: string[]; defaultText?: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}{p.required && " *"}</span>
      <select 
        {...p} 
        className="w-full text-xs font-medium px-3.5 py-4 bg-[#0f172a] border border-blue-950/40 rounded-lg text-white outline-none focus:ring-1 focus:ring-blue-500/80 focus:border-blue-500/80 transition-all disabled:bg-slate-100 disabled:text-slate-400 appearance-none [color-scheme:dark]"
        style={{ backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'></polyline></svg>")`, backgroundSize: '16px', backgroundPosition: 'calc(100% - 12px) center', backgroundRepeat: 'no-repeat' }}
      >
        <option value="" className="text-slate-500 bg-[#0f172a]">{defaultText}</option>
        {options.map(o => (
          <option key={o} value={o} className="text-white bg-[#0f172a]">
            {o[0].toUpperCase() + o.slice(1)}
          </option>
        ))}
      </select>
    </label>
  );
}