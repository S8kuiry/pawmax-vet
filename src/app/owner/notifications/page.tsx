import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth";
import { Bell } from "lucide-react";

export default async function OwnerNotificationsPage() {
  const session = await getSession();
  await dbConnect();
  const items = await Notification.find({ userId: session!.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  return (
    <div>
      <h1 className="text-2xl font-bold text-blue-700">Notifications</h1>
      <p className="text-slate-500 mt-1">Updates about bookings, prescriptions, and reminders.</p>

      {items.length === 0 ? (
        <div className="mt-6 text-center py-16 bg-white border border-dashed rounded-xl">
          <Bell className="size-10 mx-auto text-slate-300" />
          <p className="mt-3 text-slate-500">No notifications yet</p>
          <Link href="/owner/vets" className="inline-block mt-3 text-blue-600 font-medium hover:underline">
            Book a vet →
          </Link>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {items.map((n: Record<string, unknown>) => (
            <li key={String(n._id)} className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="font-medium text-slate-900">{(n.title as string) || "Notification"}</p>
              {typeof n.body === "string" && n.body && (
                <p className="text-sm text-slate-600 mt-1">{n.body}</p>
              )}
              <p className="text-xs text-slate-400 mt-2">
                {new Date(n.createdAt as string).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
