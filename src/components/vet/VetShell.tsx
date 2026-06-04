"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, CalendarClock, CalendarDays, ClipboardList, DollarSign,
  FileText, LayoutDashboard, LogOut, MessageSquare, PawPrint, Stethoscope,
  User, Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

const groups = [
  {
    label: "Workspace",
    items: [
      { href: "/vet/dashboard", label: "Overview", icon: LayoutDashboard },
      { href: "/vet/schedule", label: "Schedule", icon: CalendarDays },
      { href: "/vet/bookings", label: "Bookings", icon: CalendarDays },
      { href: "/vet/consultations", label: "Consultations", icon: Video },
    ],
  },
  {
    label: "Clinical",
    items: [
      { href: "/vet/patients", label: "Patients", icon: PawPrint },
      { href: "/vet/records", label: "Records", icon: ClipboardList },
      { href: "/vet/prescriptions", label: "Prescriptions", icon: FileText },
    ],
  },
  {
    label: "Practice",
    items: [
      { href: "/vet/messages", label: "Messages", icon: MessageSquare },
      { href: "/vet/notifications", label: "Notifications", icon: Bell },
      { href: "/vet/availability", label: "Availability", icon: CalendarClock },
      { href: "/vet/earnings", label: "Earnings", icon: DollarSign },
      { href: "/vet/profile", label: "Profile", icon: User },
    ],
  },
];

export function VetShell({
  children,
  userName,
  initials,
}: {
  children: React.ReactNode;
  userName: string;
  initials: string;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex bg-[#F6F7F9] text-slate-900">
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-[#0E1525] text-slate-200 border-r border-white/5">
        <div className="px-6 py-6 flex items-center gap-3 border-b border-white/5">
          <div className="size-10 rounded-xl bg-blue-500/15 grid place-items-center ring-1 ring-blue-400/30">
            <Stethoscope className="size-5 text-blue-400" />
          </div>
          <div className="leading-tight">
            <p className="font-semibold tracking-tight">Vellum Vet</p>
            <p className="text-xs text-slate-400">Clinic console</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.label} className="space-y-1">
              <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-slate-500">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-white/10 text-white"
                        : "text-slate-300 hover:bg-white/5 hover:text-white",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/5">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
            >
              <LogOut className="size-4" /> Sign out
            </button>
          </form>
          <div className="mt-4 flex items-center gap-3 px-3">
            <div className="size-9 rounded-full bg-blue-500/20 grid place-items-center text-sm font-semibold text-blue-300">
              {initials}
            </div>
            <div className="leading-tight min-w-0">
              <p className="text-sm font-medium text-slate-100 truncate">{userName}</p>
              <p className="text-xs text-slate-500">Veterinarian</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
