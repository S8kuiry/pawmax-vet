"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell, CalendarClock, CalendarDays, ClipboardList, DollarSign,
  FileText, LayoutDashboard, LogOut, MessageSquare, PawPrint, Stethoscope,
  User, Video,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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

const CONSULT_ROOM = /^\/vet\/consultations\/[^/]+$/;

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
  const [isOpen, setIsOpen] = useState(false);
  const fullscreen = CONSULT_ROOM.test(pathname ?? "");

  if (fullscreen) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

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
                      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors",
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

        {/* Container needs 'relative' so the dropdown displays correctly above it */}
        <div className="relative p-4 border-t border-gray-200/40 bg-[#0E1525] shrink-0">

          {/* Floating Dropdown Menu */}
          {isOpen && (
            <div className="absolute bottom-full left-4 right-4 mb-2 p-1.5 rounded-xl border border-[#243249]/50 bg-[#111a2e] shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-2 duration-100">
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13.5px] font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/20 transition-all duration-150 group outline-none"
                >
                  <LogOut className="size-[17px] stroke-[2] text-slate-500 group-hover:text-red-400 transition-colors" />
                  <span>Log out</span>
                </button>
              </form>
            </div>
          )}

          {/* Interactive Profile Trigger Strip */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between gap-3 p-2 rounded-xl transition-all duration-150 group outline-none hover:bg-[#162032]/60 text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Initials Avatar Badge */}
              <div className="size-9 rounded-full flex items-center justify-center text-xs font-bold text-slate-200 bg-[#172237] border border-[#243249]/40 group-hover:border-slate-500/40 transition-colors shrink-0">
                {initials}
              </div>

              {/* User Info Matrix */}
              <div className="flex flex-col min-w-0">
                <p className="text-[13.5px] font-semibold text-slate-200 tracking-tight leading-none mb-1 truncate">
                  {userName}
                </p>
                <p className="text-[11px] font-medium text-slate-500 tracking-normal leading-none truncate">
                  Veterninarian
                </p>
              </div>
            </div>

            {/* Clean, subtle micro-indicator dot or down arrow (Optional decoration matching Vellum) */}
            <div className="size-1.5 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors shrink-0 mr-1" />
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}
