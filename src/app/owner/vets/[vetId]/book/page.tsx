"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, Loader2, Check } from "lucide-react";

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
    <div className="w-full max-w-3xl mx-auto px-6 py-10 flex flex-col items-center">
      
      {/* Top Left Navigation Anchor aligned with form boundary */}
      <div className="w-full max-w-2xl flex justify-start mb-5">
        <Link
          href={`/owner/vets/${vetId}`}
          className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-blue-600 transition-colors"
        >
          <ArrowLeft className="size-3.5" /> Back to profile
        </Link>
      </div>

      {/* Structured Header Stack */}
      <div className="w-full max-w-2xl text-left mb-8">
        <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block mb-1">
          Scheduling Pipeline
        </span>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Book Consultation
        </h1>
        <p className="text-xs text-slate-400 mt-1.5 max-w-xl leading-relaxed">
          Select your patient profile and anchor an open slot. Appointments are locked and routed instantly upon confirmation.
        </p>
      </div>

      {/* Main Container Card: White background with clean shadow profile */}
      {pets.length === 0 ? (
        <div className="w-full max-w-2xl bg-white border border-slate-100 rounded-2xl p-8 text-center shadow-sm">
          <p className="text-sm text-slate-600">
            Add a pet first.{" "}
            <Link href="/owner/pets/new" className="font-semibold text-blue-600 underline hover:text-blue-700 ml-1">
              Add pet →
            </Link>
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="w-full max-w-2xl bg-white border border-slate-200/80 rounded-2xl p-8 space-y-6 shadow-md shadow-slate-400/80">
          
          {error && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 p-3.5 rounded-xl">
              {error}
            </p>
          )}

          {/* Select Input Field with Deep Dark-Navy Background Style */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Pet Name *
            </label>
            <div className="relative">
              <select 
                name="petId" 
                required 
                className="w-full bg-[#0b111e] border border-transparent text-white text-sm rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
              >
                {pets.map((p) => (
                  <option key={p._id} value={p._id} className="bg-[#0b111e] text-white">
                    {p.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Core Timeline Selection Module */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Calendar className="size-3.5 text-blue-600" />
              Available Timeline Segments
            </label>

            {loadingSlots ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-8 justify-center bg-[#0b111e] rounded-xl text-slate-300">
                <Loader2 className="size-4 animate-spin text-blue-500" /> Syncing clinic parameters...
              </div>
            ) : slots.length === 0 ? (
              <div className="p-5 bg-[#0b111e] rounded-xl text-xs text-slate-400 text-center leading-relaxed">
                No open scheduling parameters found for this clinician. Please map another node or review standard operating parameters.
              </div>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto pr-1 custom-scrollbar">
                {Object.entries(grouped).map(([dateLabel, daySlots]) => (
                  <div key={dateLabel} className="space-y-2">
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wide">
                      {dateLabel}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {daySlots.map((slot) => {
                        const selected = selectedSlotId === slot._id;
                        return (
                          <button
                            key={slot._id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot._id)}
                            className={`flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-semibold transition-all duration-100 ${
                              selected
                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                                : "bg-[#0b111e] text-slate-200 hover:bg-[#121b2e]"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <Clock className={`size-3.5 ${selected ? "text-white" : "text-slate-400"}`} />
                              {formatSlotTime(slot.startTime)}
                            </span>
                            {selected && <Check className="size-3.5 text-white" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Dropdown for Mode Selection */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Consultation Modality
            </label>
            <div className="relative">
              <select 
                name="mode" 
                className="w-full bg-[#0b111e] border border-transparent text-white text-sm rounded-xl px-4 py-3.5 appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all font-medium"
              >
                <option value="video" className="bg-[#0b111e] text-white">Video Telehealth</option>
                <option value="in-person" className="bg-[#0b111e] text-white">In-Clinic Physical Placement</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>

          {/* Case Description Input Field */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
              Reason for Visit / Symptoms
            </label>
            <textarea
              name="reason"
              rows={3}
              className="w-full bg-[#0b111e] border border-transparent text-white text-sm rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all resize-none placeholder-slate-500 leading-relaxed font-medium"
              placeholder="Briefly map baseline metrics, behavioral deviations, or targeted clinical requirements..."
            />
          </div>

          {/* Action Execution Button styled matching "Commit Changes" */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || loadingSlots || slots.length === 0}
              className="inline-flex items-center gap-1.5 bg-blue-600 text-white font-medium text-xs  tracking-wider px-5 py-3 rounded-xl hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  Locking Matrix...
                </>
              ) : (
                <>
                  <Check className="size-4" />
                  Confirm  Booking 
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}