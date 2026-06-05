"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, Loader2 } from "lucide-react";

type Slot = {
  _id: string;
  startTime: string;
  endTime: string;
  status: string;
};

export default function BookVetPage({ params }: { params: Promise<{ vetId: string }> }) {
  const router = useRouter();
  const [vetId, setVetId] = useState("");
  const [pets, setPets] = useState<{ _id: string; name: string }[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    params.then((p) => {
      setVetId(p.vetId);
      fetchSlots(p.vetId);
    });
    fetch("/api/pets", { credentials: "include" })
      .then((r) => r.json())
      .then((d) => setPets(d.pets || []));
  }, [params]);

  async function fetchSlots(id: string) {
    setLoadingSlots(true);
    setError("");
    try {
      const res = await fetch(`/api/vets/${id}/slots`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load slots");
      setSlots(data.slots || []);
    } catch (err: unknown) {
      setSlots([]);
      setError(err instanceof Error ? err.message : "Failed to load available slots");
    } finally {
      setLoadingSlots(false);
    }
  }

  function formatSlotTime(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function groupSlotsByDate(slotList: Slot[]) {
    const groups: Record<string, Slot[]> = {};
    for (const slot of slotList) {
      const key = new Date(slot.startTime).toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
      if (!groups[key]) groups[key] = [];
      groups[key].push(slot);
    }
    return groups;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!selectedSlotId) {
      setError("Please select an available time slot");
      return;
    }

    setLoading(true);
    const fd = new FormData(e.currentTarget);
    const petId = String(fd.get("petId"));

    const res = await fetch("/api/bookings", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        vetId,
        petId,
        slotId: selectedSlotId,
        mode: fd.get("mode"),
        reason: fd.get("reason"),
      }),
    });
    setLoading(false);
    const data = await res.json().catch(() => ({} as { error?: string; booking?: { _id: string } }));
    if (!res.ok) {
      setError(data.error || "Booking failed");
      if (res.status === 409) fetchSlots(vetId);
      return;
    }
    router.push(`/owner/bookings/${data.booking._id}`);
    router.refresh();
  }

  const grouped = groupSlotsByDate(slots);

  return (
    <div className="max-w-lg">
      <Link
        href={`/owner/vets/${vetId}`}
        className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4"
      >
        <ArrowLeft className="size-4" /> Back
      </Link>
      <h1 className="text-2xl font-bold text-blue-700">Book consultation</h1>
      <p className="text-slate-500 mt-1">
        Choose a pet and pick from the vet&apos;s published availability. Your vet will confirm the request.
      </p>

      {pets.length === 0 ? (
        <div className="mt-6 p-4 bg-amber-50 text-amber-800 rounded-lg text-sm">
          Add a pet first.{" "}
          <Link href="/owner/pets/new" className="font-medium underline">
            Add pet →
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="mt-6 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
          {error && <p className="text-sm text-red-600">{error}</p>}

          <label className="block text-sm font-medium">
            Pet
            <select name="petId" required className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2">
              {pets.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <div>
            <label className="block text-sm font-medium mb-2 flex items-center gap-1.5">
              <Calendar className="size-4 text-blue-600" />
              Available slots
            </label>

            {loadingSlots ? (
              <div className="flex items-center gap-2 text-sm text-slate-500 py-6 justify-center">
                <Loader2 className="size-4 animate-spin" /> Loading available times…
              </div>
            ) : slots.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-lg text-sm text-slate-600">
                This vet has no open slots right now. Check back later or try another veterinarian.
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
                {Object.entries(grouped).map(([dateLabel, daySlots]) => (
                  <div key={dateLabel}>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                      {dateLabel}
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {daySlots.map((slot) => {
                        const selected = selectedSlotId === slot._id;
                        return (
                          <button
                            key={slot._id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot._id)}
                            className={`flex items-center gap-2 w-full text-left px-3 py-2.5 rounded-lg border text-sm transition ${
                              selected
                                ? "border-blue-600 bg-blue-50 text-blue-800 ring-1 ring-blue-600"
                                : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"
                            }`}
                          >
                            <Clock className="size-3.5 shrink-0" />
                            {formatSlotTime(slot.startTime)}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
            <textarea
              name="reason"
              rows={3}
              className="mt-1 w-full border border-slate-300 rounded-lg px-3 py-2"
              placeholder="Briefly describe the concern"
            />
          </label>
          <button
            type="submit"
            disabled={loading || loadingSlots || slots.length === 0}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Booking…" : "Request booking"}
          </button>
        </form>
      )}
    </div>
  );
}
