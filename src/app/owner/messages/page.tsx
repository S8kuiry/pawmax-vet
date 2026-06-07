import Link from "next/link";
import { MessageSquare, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { EmptyState } from "@/components/owner/EmptyState";
import Thread from "@/models/Thread";
import Booking from "@/models/Booking";
import { PageHeader } from "@/components/owner/PageHeader";

export default async function MessagesPage() {
  const session = await getSession();
  await dbConnect();

  const threads = await Thread.find({ ownerId: session!.id })
    .sort({ lastMessageAt: -1 })
    .populate("vetId", "name")
    .populate("petId", "name species")
    .lean();

  const bookingIds = await Promise.all(
    threads.map((t) => {
      const q: Record<string, unknown> = {
        vetId: t.vetId,
        ownerId: t.ownerId,
      };
      if (t.petId) q.petId = t.petId;
      return Booking.findOne(q).sort({ startAt: -1 }).select("_id").lean();
    }),
  );

  return (
    <div className="space-y-5 max-w-7xl mx-auto px-4">
      <PageHeader
        title="Messages"
        description="Chat with your vets before, during, and after each consultation."
      />

      {threads.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No conversations yet"
          description="Once you book a consultation, you can message your vet here."
          ctaLabel="Find a vet"
          ctaHref="/owner/vets"
        />
      ) : (
        /* Compact, ultra-sleek container card with low-profile borders and precise layout */
        <div className="bg-white border border-slate-200/70 rounded-xl shadow-sm divide-y divide-slate-100 overflow-hidden">
          {threads.map((t: Record<string, any>, i: number) => {
            const vet = t.vetId as { name?: string } | null;
            const pet = t.petId as { name?: string } | null;
            const bookingId = bookingIds[i]?._id;
            const initials = (vet?.name ?? "V")
              .split(" ")
              .map((n) => n[0])
              .slice(0, 2)
              .join("")
              .toUpperCase();

            return (
              <Link
                key={String(t._id)}
                href={bookingId ? `/owner/bookings/${bookingId}` : "/owner/bookings"}
                className="flex items-center gap-3.5 px-4 py-3.5 hover:bg-slate-50/70 transition-colors group"
              >
                {/* Scaled-down compact avatar with clean type tracking */}
                <div className="size-10 rounded-full bg-gradient-to-br from-blue-400/90 to-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 tracking-wider shadow-sm">
                  {initials}
                </div>

                {/* Highly structured, space-efficient core layout */}
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 items-center gap-2">
                  
                  {/* Left Column Stack: Actor Identity & Pet Assignment Label */}
                  <div className="md:col-span-2 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                        Dr. {vet?.name ?? "Vet"}
                      </p>
                      {pet && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold tracking-wide border border-slate-200/30">
                          {pet.name}
                        </span>
                      )}
                    </div>
                    {/* Inline message preview immediately below identity boundary */}
                    <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
                      {t.lastMessage || "No messages yet — say hello to your vet."}
                    </p>
                  </div>

                  {/* Right Column Stack: Timestamp Metrics & Operational State Badges */}
                  <div className="md:col-span-2 flex items-center justify-between md:justify-end gap-4 ml-auto w-full md:w-auto">
                    <span className="text-[11px] font-medium text-slate-400 whitespace-nowrap">
                      {new Date(t.lastMessageAt as string).toLocaleString(undefined, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false
                      })}
                    </span>
                    
                    {/* Notification badge placed tightly alongside alignment grid */}
                    {(t.unreadForOwner as number) > 0 ? (
                      <span className="inline-flex items-center justify-center size-5 rounded-full bg-blue-600 text-white text-[10px] font-bold tracking-tight shadow-sm shadow-blue-200 shrink-0">
                        {t.unreadForOwner}
                      </span>
                    ) : (
                      <div className="size-5 flex items-center justify-center shrink-0">
                        <ChevronRight className="size-3.5 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                      </div>
                    )}
                  </div>

                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}