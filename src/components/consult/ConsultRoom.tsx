"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PhoneOff } from "lucide-react";
import JitsiCall from "./JitsiCall";
import ConsultChat from "./ConsultChat";

type Props = {
  bookingId: string;
  currentUserId: string;
  role: "vet" | "owner";
  displayName: string;
  email?: string;
  title: string;
  returnHref: string;
};

export default function ConsultRoom({
  bookingId,
  currentUserId,
  role,
  displayName,
  email,
  title,
  returnHref,
}: Props) {
  const router = useRouter();
  const [ending, setEnding] = useState(false);

  const leaveRoom = useCallback(() => {
    router.push(returnHref);
  }, [router, returnHref]);

  const endConsultation = useCallback(async () => {
    if (role !== "vet" || ending) return;
    if (!window.confirm("End this consultation for both parties?")) return;

    setEnding(true);
    try {
      await fetch(`/api/consult/${bookingId}/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ complete: true }),
      });
    } catch {
      /* still navigate away */
    } finally {
      router.push(returnHref);
    }
  }, [bookingId, role, ending, router, returnHref]);

  return (
    <div className="flex flex-col h-screen">
      <header className="shrink-0 flex items-center justify-between gap-4 px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={returnHref}
            className="size-9 rounded-lg bg-slate-800 text-slate-300 grid place-items-center hover:bg-slate-700 hover:text-white transition"
            aria-label="Leave consultation"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="min-w-0">
            <p className="text-sm font-medium text-white truncate">{title}</p>
            <p className="text-xs text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-red-500 animate-pulse" />
                Live video consultation
              </span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {role === "vet" && (
            <button
              type="button"
              onClick={endConsultation}
              disabled={ending}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              <PhoneOff className="size-4" />
              End consultation
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-0 lg:gap-4 p-0 lg:p-4">
        <div className="min-h-[280px] lg:min-h-0">
          <JitsiCall
            roomName={bookingId}
            displayName={displayName}
            email={email}
            onHangup={leaveRoom}
          />
        </div>
        <div className="min-h-[320px] lg:min-h-0 border-t lg:border-t-0 border-slate-800 lg:border-none">
          <ConsultChat
            bookingId={bookingId}
            currentUserId={currentUserId}
            senderRole={role}
            disabled={ending}
          />
        </div>
      </div>
    </div>
  );
}
