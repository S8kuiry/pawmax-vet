"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";

export function TopBar() {
  const path = usePathname();
  const isVet = path?.startsWith("/vet");

  const ownerNav = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/vets",      label: "Find Vets" },
    { href: "/bookings",  label: "My Bookings" },
  ];
  const vetNav = [
    { href: "/vet/dashboard", label: "Dashboard" },
    { href: "/vet/schedule",  label: "Schedule" },
    { href: "/vet/bookings",  label: "Bookings" },
  ];
  const nav = isVet ? vetNav : ownerNav;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-100">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center gap-1">
          {nav.map(n => (
            <Link key={n.href} href={n.href}
              className={cn("px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                path === n.href ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:text-brand-700 hover:bg-brand-50/60")}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link href="/login" className="text-sm text-slate-600 hover:text-brand-700">Sign in</Link>
          <Link href="/register" className="text-sm font-medium bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-700">Get started</Link>
        </div>
      </div>
    </header>
  );
}
