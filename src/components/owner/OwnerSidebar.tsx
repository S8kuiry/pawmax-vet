"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PawPrint, CalendarDays, Stethoscope, FileText,
  Pill, MessageSquare, CreditCard, Bell, Settings, LogOut, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV = [
  {
    section: "Main", items: [
      { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ]
  },
  {
    section: "Care", items: [
      { href: "/owner/pets", label: "My Pets", icon: PawPrint },
      { href: "/owner/records", label: "Records", icon: FileText },
      { href: "/owner/prescriptions", label: "Prescriptions", icon: Pill },
    ]
  },
  {
    section: "Vet", items: [
      { href: "/owner/vets", label: "Find a Vet", icon: Stethoscope },
      { href: "/owner/bookings", label: "Bookings", icon: CalendarDays },
      { href: "/owner/messages", label: "Messages", icon: MessageSquare },
    ]
  },
  {
    section: "Account", items: [
      { href: "/owner/payments", label: "Payments", icon: CreditCard },
      { href: "/owner/notifications", label: "Notifications", icon: Bell },
      { href: "/owner/settings", label: "Settings", icon: Settings },
    ]
  },
];

export function OwnerSidebar({ user }: { user: { name: string; email: string } }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const initials = user.name.split(" ").map(p => p[0]).slice(0, 2).join("").toUpperCase();
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-[#0E1525] border-r border-blue-700 flex flex-col z-30 text-white">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-gray-200/40 ">
        <div className="size-9 rounded-xl bg-white grid place-items-center text-blue-600 font-bold">P</div>
        <span className="font-semibold text-white">PetCare</span>
      </div>

      <Link
        href="/owner/book"
        className="mx-4 mt-4 inline-flex items-center justify-center gap-2 rounded-lg bg-white text-blue-600 text-sm font-medium py-2.5 hover:bg-blue-50 transition"
      >
        <Plus className="size-4" /> Book a Vet
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {NAV.map((group) => (
          <div key={group.section}>
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-wider text-blue-200">
              {group.section}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((it) => {
                const active = pathname === it.href || pathname?.startsWith(it.href + "/");
                return (
                  <li key={it.href}>
                    <Link
                      href={it.href}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition",
                        active
                          ? "bg-white text-blue-700 font-medium"
                          : "text-blue-100 hover:bg-white hover:text-blue-700"
                      )}
                    >
                      <it.icon className="size-4" />
                      {it.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
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
                {user.name}
              </p>
              <p className="text-[11px] font-medium text-slate-500 tracking-normal leading-none truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Clean, subtle micro-indicator dot or down arrow (Optional decoration matching Vellum) */}
          <div className="size-1.5 rounded-full bg-slate-600 group-hover:bg-blue-400 transition-colors shrink-0 mr-1" />
        </button>
      </div>
    </aside>
  );
}