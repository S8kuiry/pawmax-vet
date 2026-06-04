import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { VetShell } from "@/components/vet/VetShell";

export default async function VetLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session || (session.role !== "vet" && session.role !== "admin")) {
    redirect("/login");
  }

  await import("@/lib/db").then(({ dbConnect }) => dbConnect());
  const User = (await import("@/models/User")).default;
  const user = await User.findById(session.id).select("name email").lean();
  const name = (user?.name as string) || session.email;
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "V";

  return (
    <VetShell userName={name.startsWith("Dr") ? name : `Dr. ${name}`} initials={initials}>
      {children}
    </VetShell>
  );
}
