"use client";

import { useState } from "react";
import Link from "next/link";
import { PawPrint, Stethoscope } from "lucide-react";
import { homePathForRole } from "@/lib/auth-redirect";

type Role = "owner" | "vet";

export default function LoginPage() {
  const [role, setRole] = useState<Role>("owner");
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (role === "vet") {
      try {
        const res = await fetch("/api/auth/vet_login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        if (!data.user?.role) throw new Error("Invalid login response");
        window.location.assign(homePathForRole(data.user.role));
        return;

      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }

    } else {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, role }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Login failed");
        if (!data.user?.role) throw new Error("Invalid login response");
        window.location.assign(homePathForRole(data.user.role));
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
      <div className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <div className="h-10 w-10 rounded-xl bg-brand-600 grid place-items-center">
              <PawPrint className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-semibold text-slate-900">
              PetCare<span className="text-brand-600">Vet</span>
            </span>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-slate-500">Sign in to continue.</p>

          {/* Role toggle */}
          <div className="mt-6 inline-flex rounded-xl bg-slate-100 p-1 w-full">
            <RoleTab
              active={role === "owner"}
              onClick={() => setRole("owner")}
              icon={<PawPrint className="h-4 w-4" />}
              label="Pet Parent"
            />
            <RoleTab
              active={role === "vet"}
              onClick={() => setRole("vet")}
              icon={<Stethoscope className="h-4 w-4" />}
              label="Veterinarian"
            />
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email" required placeholder="Email" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />
            <input
              type="password" required placeholder="Password" value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            />

            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-sm text-brand-600 font-medium">
                Forgot password?
              </Link>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium py-3 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : `Sign in as ${role === "vet" ? "Vet" : "Pet Parent"}`}
            </button>
          </form>

          <p className="mt-6 text-sm text-slate-600 text-center">
            New here?{" "}
            <Link href="/register" className="text-brand-600 font-semibold">Create account</Link>
          </p>
        </div>
      </div>

      <div className="hidden lg:flex bg-gradient-to-br from-brand-600 to-brand-800 text-white p-12 items-center">
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            {role === "vet" ? "Grow your practice online." : "Care that travels with your pet."}
          </h2>
          <p className="mt-4 text-brand-100 text-lg">
            {role === "vet"
              ? "Manage bookings, consult by video, and get paid weekly."
              : "Find trusted vets, book in minutes, keep every record in one place."}
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleTab({
  active, onClick, icon, label,
}: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-medium transition ${active ? "bg-white text-brand-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
        }`}
    >
      {icon}
      {label}
    </button>
  );
}
