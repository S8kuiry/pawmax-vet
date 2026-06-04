"use client";

import { useState } from "react";

type VetUser = {
  name?: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
};

export function VetProfileForm({ user }: { user: VetUser }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: user.name ?? "",
    phone: user.phone ?? "",
    specialty: user.specialty ?? "",
    licenseNumber: user.licenseNumber ?? "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    const res = await fetch("/api/vet/profile", {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setMessage(data.error || "Save failed");
      return;
    }
    setMessage("Profile saved.");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl bg-white border border-slate-200 p-6">
      {[
        ["Full name", "name"],
        ["Specialization", "specialty"],
        ["Phone", "phone"],
        ["License number", "licenseNumber"],
      ].map(([label, key]) => (
        <div key={key}>
          <label className="block text-sm font-medium mb-1.5">{label}</label>
          <input
            value={form[key as keyof typeof form]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      ))}
      {message && <p className="text-sm text-slate-600">{message}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-slate-900 text-white px-5 py-2.5 text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
