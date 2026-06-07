import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { OwnerShell } from "@/components/owner/OwnerShell";
import { BgPawIcon } from "@/components/bgPawIcon";

export default async function OwnerLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session || session.role !== "owner") redirect("/login");

  await dbConnect();
  const user = await User.findById(session.id).select("name email").lean();
  const displayName = (user?.name as string) || session.email.split("@")[0];

  return (
    <OwnerShell user={{ name: displayName, email: session.email }}>
      {children}
    </OwnerShell>
  );
}
