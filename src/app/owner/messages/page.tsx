import Link from "next/link";
import { MessageSquare, ChevronRight } from "lucide-react";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import { EmptyState } from "@/components/owner/EmptyState";
import Thread from "@/models/Thread";
import { PageHeader } from "@/components/owner/PageHeader";

export default async function MessagesPage() {
  const session = await getSession();
  await dbConnect();

  const threads = await Thread.find({ ownerId: session!.id })
    .sort({ lastMessageAt: -1 })
    .populate("vetId", "name")
    .populate("petId", "name species")
    .lean();

  return (
    <div className="space-y-8">
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
        <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100">
          {threads.map((t: Record<string, unknown>) => {
            const vet = t.vetId as { name?: string } | null;
            const pet = t.petId as { name?: string } | null;
            const initials = (vet?.name ?? "V")
              .split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();

            return (
              <Link
                key={String(t._id)}
                href="/owner/messages"
                className="flex items-center gap-4 p-5 hover:bg-blue-50/40 transition group"
              >
                <div className="size-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-white flex items-center justify-center font-semibold shrink-0">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-medium text-slate-900 truncate">
                      Dr. {vet?.name ?? "Vet"}
                    </p>
                    {pet && (
                      <span className="text-xs text-slate-500">• for {pet.name}</span>
                    )}
                    {(t.unreadForOwner as number) > 0 && (
                      <span className="ml-auto inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-blue-600 text-white text-xs font-medium">
                        {t.unreadForOwner as number}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 truncate">
                    {(t.lastMessage as string) || "No messages yet — say hello to your vet."}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {new Date(t.lastMessageAt as string).toLocaleString(undefined, {
                      day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                    })}
                  </p>
                </div>
                <ChevronRight className="size-5 text-slate-400 group-hover:text-blue-600 transition" />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
