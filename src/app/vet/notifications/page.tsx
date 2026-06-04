import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Notification from "@/models/Notification";

export default async function VetNotificationsPage() {
  const session = await getSession();
  await dbConnect();
  const items = await Notification.find({ userId: session!.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();
  const unread = items.filter((n) => !n.readAt).length;

  return (
    <div className="px-10 py-10 max-w-[1400px] mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Practice</p>
        <h1 className="text-3xl font-semibold">Notifications</h1>
        <p className="mt-2 text-slate-500">{unread} unread</p>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No notifications.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((n) => (
            <li key={String(n._id)} className={`rounded-2xl border p-5 ${n.readAt ? "bg-white border-slate-200" : "bg-blue-50 border-blue-200"}`}>
              <p className="font-medium">{n.title || n.type}</p>
              {n.body && <p className="text-sm text-slate-600 mt-1">{n.body}</p>}
              <p className="text-xs text-slate-400 mt-2">{new Date(n.createdAt as Date).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
