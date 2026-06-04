import Link from "next/link";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Thread from "@/models/Thread";

export default async function VetMessagesPage() {
  const session = await getSession();
  await dbConnect();
  const threads = await Thread.find({ vetId: session!.id })
    .sort({ lastMessageAt: -1 })
    .populate("ownerId", "name email")
    .populate("petId", "name")
    .lean();

  return (
    <div className="h-[calc(100vh-0px)] flex">
      <aside className="w-80 border-r border-slate-200 bg-white overflow-y-auto">
        <div className="px-5 py-4 border-b border-slate-200">
          <h1 className="text-lg font-semibold">Messages</h1>
        </div>
        {threads.length === 0 ? (
          <p className="px-5 py-8 text-sm text-slate-500">No conversations yet.</p>
        ) : (
          threads.map((t: Record<string, unknown>) => {
            const owner = t.ownerId as { name?: string } | null;
            const pet = t.petId as { name?: string } | null;
            return (
              <div key={String(t._id)} className="w-full text-left px-5 py-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{owner?.name ?? "Owner"}</p>
                  <span className="text-xs text-slate-400">
                    {new Date(t.lastMessageAt as string).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-500 truncate">
                  {pet?.name ? `${pet.name}: ` : ""}{(t.lastMessage as string) || "—"}
                </p>
                {Number(t.unreadForVet) > 0 && (
                  <span className="text-xs text-blue-600">{Number(t.unreadForVet)} unread</span>
                )}
              </div>
            );
          })
        )}
      </aside>
      <section className="flex-1 grid place-items-center text-slate-400 text-sm p-8 text-center">
        <p>Select a thread from the list. Messaging is tied to bookings under each patient.</p>
        <Link href="/vet/bookings" className="mt-3 text-blue-600 font-medium">View bookings →</Link>
      </section>
    </div>
  );
}
