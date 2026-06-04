import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function ConsultEntryPage({
  params,
}: {
  params: Promise<{ bookingId: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const { bookingId } = await params;

  if (session.role === "vet") redirect(`/vet/consultations/${bookingId}`);
  if (session.role === "owner") redirect(`/owner/consultations/${bookingId}`);

  redirect("/");
}
