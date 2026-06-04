import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { ArrowLeft, Star, Calendar, Award } from "lucide-react";

export default async function VetProfile({ params }: { params: Promise<{ vetId: string }> }) {
  const { vetId } = await params;
  await dbConnect();
  const v = await User.findOne({ _id: vetId, role: "vet" }).lean() as Record<string, unknown> | null;
  if (!v) notFound();

  return (
    <div className="max-w-3xl">
      <Link href="/owner/vets" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="size-4" /> Back to vets
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex gap-5 items-start">
          <div className="size-20 rounded-2xl bg-blue-100 text-blue-700 grid place-items-center text-2xl font-bold">
            {String(v.name).split(" ").map((n: string) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Dr. {String(v.name)}</h1>
            <p className="text-slate-500">{(v.specialty as string) || "General Practice"}</p>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1 text-amber-500"><Star className="size-4 fill-current" /> 4.8</span>
              <span className="text-slate-500">Verified vet</span>
            </div>
          </div>
          <Link href={`/owner/vets/${v._id}/book`} className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center gap-2">
            <Calendar className="size-4" /> Book
          </Link>
        </div>

        <section className="mt-6">
          <h2 className="font-semibold mb-2">About</h2>
          <p className="text-slate-600 text-sm">Experienced veterinarian dedicated to your pet&apos;s wellbeing.</p>
        </section>

        <section className="mt-6">
          <h2 className="font-semibold mb-2 flex items-center gap-2"><Award className="size-4 text-blue-600" /> Qualifications</h2>
          <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
            <li>{v.licenseNumber ? `License ${v.licenseNumber}` : "BVSc & AH"}</li>
          </ul>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
          <div><p className="text-xs text-slate-500">Consultation fee</p><p className="font-semibold">₹500</p></div>
          <div><p className="text-xs text-slate-500">KYC</p><p className="font-semibold capitalize">{(v.kycStatus as string) || "pending"}</p></div>
        </section>
      </div>
    </div>
  );
}
