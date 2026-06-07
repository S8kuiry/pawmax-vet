import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Notification from "@/models/Notification";
import { getSession } from "@/lib/auth";
import { Bell, BellRing, Clock, Inbox, Calendar, Pill, AlertCircle, BookmarkCheck, ArrowRight } from "lucide-react";

export default async function OwnerNotificationsPage() {
  const session = await getSession();
  await dbConnect();
  
  const items = await Notification.find({ userId: session!.id })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  // Dynamically extract read status if tracking flags exist on your notifications schema
  const unread = items.filter((n: any) => !n.readAt).length;

  // Contextual icon routing engine customized for Pet Owners
  const getNotificationIcon = (type: string, isUnread: boolean) => {
    const iconClass = `size-5 ${isUnread ? "text-blue-600" : "text-slate-400"}`;
    switch (type?.toLowerCase()) {
      case "booking":
      case "appointment":
        return <Calendar className={iconClass} />;
      case "prescription":
      case "medication":
        return <Pill className={`size-5 ${isUnread ? "text-emerald-600" : "text-slate-400"}`} />;
      case "alert":
      case "reminder":
        return <AlertCircle className={`size-5 ${isUnread ? "text-amber-500" : "text-slate-400"}`} />;
      default:
        return isUnread ? <BellRing className={iconClass} /> : <Bell className={iconClass} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/30 py-4 max-w-[1400px] mx-auto space-y-8">
      
      {/* Header View Block */}
      <div className="border-b border-slate-100 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">
          <BookmarkCheck className="size-3.5 text-blue-500" />
          <span>Pet Parent Account</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notifications</h1>
        <p className="text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
          Updates about bookings, prescriptions, and reminders for your pets.
        </p>
      </div>

      {/* Main Grid Splitting Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* 🔵 MATCHING PREMIUM DARK BLUE HERO BOX */}
        <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl relative overflow-hidden">
          {/* Subtle Ambient Backlighting Aura */}
          <div className="absolute -right-10 -top-10 size-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative space-y-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20">
                Care Feed Live
              </span>
              <h2 className="text-lg font-bold tracking-tight mt-4 text-slate-100">Updates Summary</h2>
            </div>

            {/* Micro Dashboard Statistics Cards Track */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <p className="text-xs font-medium text-slate-400">Unread</p>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="text-2xl font-bold text-white">{unread}</span>
                  {unread > 0 && <span className="size-2 rounded-full bg-blue-500 animate-pulse" />}
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">
                <p className="text-xs font-medium text-slate-400">Total Logs</p>
                <span className="text-2xl font-bold text-slate-300 block mt-1">{items.length}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10 text-xs text-slate-400 flex items-center gap-2 leading-relaxed">
              <Clock className="size-3.5 text-blue-400 shrink-0" />
              <span>Real-time alerts processed chronologically.</span>
            </div>
          </div>
        </div>

        {/* FEED LIST REGION CONTAINER */}
        <div className="lg:col-span-3 space-y-3">
          {items.length === 0 ? (
            /* Modernized Empty Layout Box featuring Action CTA Link Routing */
            <div className="max-h-77 flex flex-col items-center justify-center text-center py-20 bg-white border border-slate-200 border-dashed rounded-2xl p-6 shadow-sm">
              <div className="size-12 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 mb-4 shadow-inner">
                <Inbox className="size-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">No notifications yet</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-xs leading-relaxed">
                Your medical dashboard timeline is currently clear. Once a clinic registers updates, they will populate here.
              </p>
              <Link 
                href="/owner/vets" 
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-xl shadow-sm hover:bg-blue-700 transition"
              >
                Book a Vet Consultation <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : (
            /* Active Notification Rows */
            <ul className="space-y-3">
              {items.map((n: Record<string, unknown>) => {
                const isUnread = !n.readAt;
                
                return (
                  <li 
                    key={String(n._id)} 
                    className={`group relative flex gap-4 p-5 rounded-2xl border transition duration-200 ${
                      isUnread 
                        ? "bg-white border-blue-200/90 shadow-sm shadow-blue-50/50 border-l-4 border-l-blue-600 pl-4" 
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    {/* Visual Icon Box */}
                    <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 border transition ${
                      isUnread 
                        ? "bg-blue-50 border-blue-100" 
                        : "bg-slate-50 border-slate-100"
                    }`}>
                      {getNotificationIcon(n.type as string, isUnread)}
                    </div>

                    {/* Notification Copy Details Block */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className={`font-semibold tracking-tight text-sm ${isUnread ? "text-slate-900" : "text-slate-700"}`}>
                          {(n.title as string) || "Notification"}
                        </h3>
                        
                        {isUnread && (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200 uppercase tracking-wide\
                          ">
                            New
                          </span>
                        )}
                      </div>

                      {typeof n.body === "string" && n.body && (
                        <p className="text-sm text-slate-600 mt-1 leading-relaxed max-w-4xl whitespace-pre-wrap">
                          {n.body}
                        </p>
                      )}

                      {/* Micro Timestamp Component Footer */}
                      <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
                        <Clock className="size-3.5 text-slate-300" />
                        <span>
                          {new Date(n.createdAt as string).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}