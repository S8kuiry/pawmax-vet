// app/settings/page.tsx
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import SettingsView from "./SettingsView/page";

export const dynamic = "force-dynamic";

type UserDoc = {
  _id: string;
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  emergencyContact?: string;
  photoUrl?: string;
  notifications?: {
    email?: boolean;
    sms?: boolean;
    vaccineAlerts?: boolean;
    marketing?: boolean;
  };
};

export default async function OwnerSettingsPage() {
  // 1. Authenticate user
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "owner") redirect("/");

  // 2. Fetch data from MongoDB
  await dbConnect();
  const user = (await User.findById(session.id)
    .select("name email phone address emergencyContact photoUrl notifications")
    .lean()) as UserDoc | null;

  if (!user) redirect("/login");

  // 3. Shape data cleanly for props
  const profile = {
    name: user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    address: user.address ?? "",
    emergencyContact: user.emergencyContact ?? "",
    photoUrl: user.photoUrl ?? "",
  };

  const notifications = {
    emailReminders: user.notifications?.email ?? true,
    smsReminders: user.notifications?.sms ?? true,
    vaccineAlerts: user.notifications?.vaccineAlerts ?? true,
    marketing: user.notifications?.marketing ?? false,
  };

  // 4. Pass directly to the view component
  return <SettingsView profile={profile} notifications={notifications} />;
}