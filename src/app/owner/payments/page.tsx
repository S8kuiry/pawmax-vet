import { redirect } from "next/navigation";

export default function OwnerPaymentsRedirect() {
  redirect("/owner/bookings");
}
