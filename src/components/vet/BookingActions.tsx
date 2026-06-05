"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

export function BookingActions({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"confirm" | "decline" | null>(null);
  const [error, setError] = useState("");

  async function updateStatus(status: "confirmed" | "declined") {
    setLoading(status === "confirmed" ? "confirm" : "decline");
    setError("");
    try {
      const res = await fetch(`/api/vet/bookings/${bookingId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-6 space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => updateStatus("confirmed")}
          disabled={!!loading}
          className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 text-sm font-medium"
        >
          <CheckCircle2 className="size-4" />
          {loading === "confirm" ? "Confirming…" : "Confirm booking"}
        </button>
        <button
          type="button"
          onClick={() => updateStatus("declined")}
          disabled={!!loading}
          className="inline-flex items-center gap-2 bg-white border border-slate-300 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50 text-sm font-medium"
        >
          <XCircle className="size-4" />
          {loading === "decline" ? "Declining…" : "Decline"}
        </button>
      </div>
    </div>
  );
}
