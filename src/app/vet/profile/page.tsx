import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import User from "@/models/User";
import { VetProfileForm } from "@/components/vet/VetProfileForm";

export default async function VetProfilePage() {
  const session = await getSession();
  await dbConnect();
  const user = await User.findById(session!.id).select("-passwordHash").lean();

  const initials = (user?.name as string || "V")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="px-10 py-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-blue-600/80 font-medium mb-2">Account</p>
        <h1 className="text-3xl font-semibold">Profile</h1>
        <p className="mt-2 text-slate-500">This is what pet parents see when they find you.</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="size-16 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-xl font-semibold">
          {initials}
        </div>
        <p className="text-sm text-slate-500">{session!.email}</p>
      </div>

      <VetProfileForm user={user as Record<string, string>} />
    </div>
  );
}
