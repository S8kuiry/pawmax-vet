"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PawPrint, CalendarDays, Stethoscope, FileText,
  Pill, MessageSquare, CreditCard, Bell, Settings, LogOut, Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { section: "Main", items: [
    { href: "/owner/dashboard", label: "Dashboard", icon: LayoutDashboard },
  ]},
  { section: "Care", items: [
    { href: "/owner/pets",          label: "My Pets",      icon: PawPrint },
    { href: "/owner/records",       label: "Records",      icon: FileText },
    { href: "/owner/prescriptions", label: "Prescriptions",icon: Pill },
  ]},
  { section: "Vet", items: [
    { href: "/owner/vets",          label: "Find a Vet",   icon: Stethoscope },
    { href: "/owner/bookings",      label: "Bookings",     icon: CalendarDays },
    { href: "/owner/messages",      label: "Messages",     icon: MessageSquare },
  ]},
  { section: "Account", items: [
    { href: "/owner/payments",      label: "Payments",     icon: CreditCard },
    { href: "/owner/notifications", label: "Notifications",icon: Bell },
    { href: "/owner/settings",      label: "Settings",     icon: Settings },
  ]},
];

export function OwnerSidebar() {
  const pathname = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-blue-600 border-r border-blue-700 flex flex-col z-30 text-white">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-blue-700">
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
                          : "text-blue-100 hover:bg-blue-500 hover:text-white"
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

      <form action="/api/auth/logout" method="post" className="p-4 border-t border-blue-700">
        <button className="w-full inline-flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-blue-100 hover:bg-red-600 hover:text-white transition">
          <LogOut className="size-4" /> Log out
        </button>
      </form>
    </aside>
  );
}