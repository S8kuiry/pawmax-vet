import { redirect } from "next/navigation";

export default async function AppointmentRedirect({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  redirect(`/owner/bookings/${appointmentId}`);
}
