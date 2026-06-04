"use client";

import { Bell, Search } from "lucide-react";

export function OwnerTopbar({ user }: { user: { name: string; email: string } }) {
  const initials = user.name.split(" ").map(p => p[0]).slice(0,2).join("").toUpperCase();
  return (
    <header className="sticky top-0 z-20 h-16 bg-blue-600 border-b border-blue-700 flex items-center justify-between px-6">
      {/* Search Bar Container - Kept White */}
      <div className="relative w-full max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
        <input
          type="search"
          placeholder="Search pets, vets, records…"
          className="w-full pl-9 pr-3 h-10 rounded-lg bg-white border border-blue-300 focus:border-blue-400 focus:outline-none text-sm text-slate-800 placeholder:text-slate-400"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="relative size-10 grid place-items-center rounded-lg hover:bg-blue-500 transition">
          <Bell className="size-5 text-blue-100" />
          <span className="absolute top-2 right-2 size-2 rounded-full bg-white" />
        </button>
        <div className="flex items-center gap-3 pl-3 border-l border-blue-500">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-white leading-tight">{user.name}</p>
            <p className="text-xs text-blue-200">{user.email}</p>
          </div>
          <div className="size-9 rounded-full bg-white grid place-items-center text-blue-600 text-sm font-semibold">
            {initials}
          </div>
        </div>
      </div>
    </header>
  );
}