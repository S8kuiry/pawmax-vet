import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import {
  consultDisplayName,
  consultTitle,
  ensureConsultThread,
  loadConsultBooking,
  markConsultationLive,
} from "@/lib/consult-session";
import ConsultRoom from "@/components/consult/ConsultRoom";

export default async function OwnerConsultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "owner") redirect("/");

  const { id } = await params;
  await dbConnect();

  const result = await loadConsultBooking(id, session);
  if (!result) notFound();

  if (result.blocked) {
    return (
      <div className="max-w-lg mx-auto mt-20 p-8 bg-white border border-slate-200 rounded-2xl text-center">
        <h1 className="text-xl font-semibold">Consultation unavailable</h1>
        <p className="text-slate-500 mt-2 text-sm">
          {result.reason === "not_video"
            ? "This booking is not a video consultation."
            : "This booking is no longer active."}
        </p>
        <Link
          href="/owner/bookings"
          className="inline-block mt-6 text-blue-600 font-medium hover:underline"
        >
          Back to bookings
        </Link>
      </div>
    );
  }

  await ensureConsultThread(result.booking as Record<string, unknown>);
  await markConsultationLive(result.booking as Record<string, unknown>);

  return (
    <ConsultRoom
      bookingId={String(result.booking._id)}
      currentUserId={session.id}
      role="owner"
      displayName={consultDisplayName(session)}
      email={session.email}
      title={consultTitle(result.booking as Record<string, unknown>, "owner")}
      returnHref="/owner/bookings"
    />
  );
}
