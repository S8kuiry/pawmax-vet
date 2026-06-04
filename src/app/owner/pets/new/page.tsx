"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(50),
  species: z.enum(["Dog", "Cat", "Rabbit", "Bird", "Reptile", "Other"]),
  breed: z.string().trim().max(50).optional(),
  dob: z.string().optional(),
  weightKg: z.coerce.number().min(0).max(200).optional(),
  gender: z.enum(["male", "female", "unknown"]).optional(),
});

export default function NewPetPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    if (!res.ok) { setError("Failed to create pet"); return; }
    router.push("/owner/pets");
    router.refresh();
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-blue-700">Add a Pet</h1>
      <p className="text-slate-500 mt-1">Tell us about your furry (or feathered) friend.</p>

      <form onSubmit={onSubmit} className="mt-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
        {error && <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{error}</div>}

        <Field label="Name" name="name" required />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Species" name="species" required options={["Dog","Cat","Rabbit","Bird","Reptile","Other"]} />
          <Field label="Breed" name="breed" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date of birth" name="dob" type="date" />
          <Field label="Weight (kg)" name="weightKg" type="number" step="0.1" />
        </div>
        <Select label="Gender" name="gender" options={["male","female","unknown"]} />

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Saving…" : "Add pet"}
          </button>
          <button type="button" onClick={() => router.back()} className="px-5 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">Cancel</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, ...p }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}{p.required && " *"}</span>
      <input {...p} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
    </label>
  );
}
function Select({ label, options, ...p }: { label: string; options: string[] } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}{p.required && " *"}</span>
      <select {...p} className="mt-1 w-full px-3 py-2 border border-slate-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
        <option value="">Select…</option>
        {options.map(o => <option key={o} value={o}>{o[0].toUpperCase()+o.slice(1)}</option>)}
      </select>
    </label>
  );
}
