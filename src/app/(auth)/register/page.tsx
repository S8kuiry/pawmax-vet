"use client";

import { useState } from "react";
import Link from "next/link";
import { PawPrint, Stethoscope } from "lucide-react";
import { pathAfterRegister } from "@/lib/auth-redirect";

type Role = "owner" | "vet";

export default function RegisterPage() {
  const [role, setRole] = useState<Role>("owner");
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (role === "vet") {
      try {
      const res = await fetch("/api/auth/vet_register", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      window.location.assign(pathAfterRegister(role));
      return;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Registration failed");
        window.location.assign(pathAfterRegister(role));
        return;
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
<Link href="/">
          <div className="flex items-center gap-2 mb-8 cursor-pointer hover:scale-105 transition-all duration-300 active:scale-95" >
            <div className="h-10 w-10 rounded-xl bg-brand-600 grid place-items-center">
              <PawPrint className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-semibold text-slate-900">
              PetCare<span className="text-brand-600">Vet</span>
            </span>
          </div>
          </Link>

          <h1 className="text-3xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-slate-500">Choose how you'll use PetCareVet.</p>

          {/* Role toggle */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <RoleCard
              active={role === "owner"}
              onClick={() => setRole("owner")}
              icon={<PawPrint className="h-5 w-5" />}
              title="Pet Parent"
              subtitle="Book vets for your pet"
            />
            <RoleCard
              active={role === "vet"}
              onClick={() => setRole("vet")}
              icon={<Stethoscope className="h-5 w-5" />}
              title="Veterinarian"
              subtitle="Offer consultations"
            />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input placeholder="Full name" value={form.name}
              onChange={(v) => setForm({ ...form, name: v })} />
            <Input type="email" placeholder="Email" value={form.email}
              onChange={(v) => setForm({ ...form, email: v })} />
            <Input placeholder="Phone (+91)" value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })} />
            <Input type="password" placeholder="Create password" value={form.password}
              onChange={(v) => setForm({ ...form, password: v })} />

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 transition disabled:opacity-60"
            >
              {loading ? "Creating..." : role === "vet" ? "Continue as Vet" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600 text-center">
            Have an account?{" "}
            <Link href="/login" className="text-brand-600 font-semibold">Sign in</Link>
          </p>
        </div>
      </div>

      {/* Right: brand panel */}
      <div className="hidden lg:flex bg-gradient-to-br from-brand-600 to-brand-800 text-white p-12 items-center">
        <div>
          <h2 className="text-4xl font-bold leading-tight">One pet record. Every vet.</h2>
          <p className="mt-4 text-brand-100 text-lg">
            Vaccinations, prescriptions, deworming — all timestamped and shareable.
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  active, onClick, icon, title, subtitle,
}: {
  active: boolean; onClick: () => void;
  icon: React.ReactNode; title: string; subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left rounded-xl border-2 p-4 transition ${active
          ? "border-brand-600 bg-brand-50"
          : "border-slate-200 hover:border-slate-300 bg-white"
        }`}
    >
      <div className={`h-9 w-9 rounded-lg grid place-items-center mb-2 ${active ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
        }`}>
        {icon}
      </div>
      <div className="font-semibold text-slate-900">{title}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </button>
  );
}

function Input({
  value, onChange, placeholder, type = "text",
}: {
  value: string; onChange: (v: string) => void;
  placeholder: string; type?: string;
}) {
  return (
    <input
      type={type}
      required
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
    />
  );
}
