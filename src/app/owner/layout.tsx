import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { OwnerSidebar } from "@/components/owner/OwnerSidebar";
import { OwnerTopbar } from "@/components/owner/OwnerTopbar";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/login");

  await dbConnect();
  const user = await User.findById(session.id).select("name email").lean();
  const displayName = (user?.name as string) || session.email.split("@")[0];

  return (
    <div className="min-h-screen bg-slate-50">
      <OwnerSidebar />
      <div className="md:pl-64">
        <OwnerTopbar user={{ name: displayName, email: session.email }} />
        <main className="px-6 py-8 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  );
}
