"use client";

import { usePathname } from "next/navigation";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar";

const CONSULT_ROOM = /^\/owner\/consultations\/[^/]+$/;

export function OwnerShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { name: string; email: string };
}) {
  const pathname = usePathname();
  const fullscreen = CONSULT_ROOM.test(pathname ?? "");

  if (fullscreen) {
    return <div className="min-h-screen bg-slate-950">{children}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <OwnerSidebar user={user} />
      <div className="md:pl-64">
        <main className="px-6 py-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
