import { redirect } from "next/navigation";

export default function OwnerBookRedirect() {
  redirect("/owner/vets");
}
