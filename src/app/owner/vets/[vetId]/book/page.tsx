"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";

export default function BookVetPage({ params }: { params: Promise<{ vetId: string }> }) {
  const router = useRouter();
  const [vetId, setVetId] = useState("");
  const [pets, setPets] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => setVetId(p.vetId));
    fetch("/api/pets", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPets(d.pets || []));
  }, [params]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const petId = String(fd.get("petId"));
    const date = String(fd.get("date"));
    const time = String(fd.get("time"));
    const startAt = new Date(`${date}T${time}:00`).toISOString();

    const res = await fetch("/api/bookings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vetId,
        petId,
        startAt,
        mode: fd.get("mode"),
        reason: fd.get("reason"),
      }),
    });
    setLoading(false);
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Booking failed");
      return;
    }
    router.push(`/owner/bookings/${data.booking._id}`);
    router.refresh();
  }

  return (
    <div className="max-w-lg">
      <Link href={`/owner/vets/${vetId}`} className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="size-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-blue-700">Book consultation</h1>
      <p className="text-slate-500 mt-1">Choose a pet, date, and time. Your vet will confirm the request.</p>

      {pets.length === 0 ? (
        <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-lg text-sm">
          Add a pet first. <Link href="/owner/pets/new" className="font-medium underline">Add pet →</Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <label className="block text-sm font-medium">
            Pet
            <select name="petId" required className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2">
              {pets.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-medium">
              Date
              <input type="date" name="date" required className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
            </label>
            <label className="block text-sm font-medium">
              Time
              <input type="time" name="time" required className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" />
            </label>
          </div>
          <label className="block text-sm font-medium">
            Mode
            <select name="mode" className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2">
              <option value="video">Video</option>
              <option value="in-person">In-person</option>
            </select>
          </label>
          <label className="block text-sm font-medium">
            Reason
            <textarea name="reason" rows={3} className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Briefly describe the concern" />
          </label>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {loading ? "Booking…" : "Request booking"}
          </button>
        </form>
      )}
    </div>
  );
}
