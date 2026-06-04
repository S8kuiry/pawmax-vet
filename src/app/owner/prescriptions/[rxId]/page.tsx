import { notFound } from "next/navigation";
import Link from "next/link";
import { dbConnect } from "@/lib/db";
import Prescription from "@/models/Prescription";
import { getSession } from "@/lib/auth";
import { ArrowLeft, Download } from "lucide-react";

export default async function RxDetail({ params }: { params: Promise<{ rxId: string }> }) {
  const { rxId } = await params;
  const session = await getSession();
  await dbConnect();
  const rx = await Prescription.findOne({ _id: rxId, ownerId: session!.idd }).lean() as any;
  if (!rx) notFound();

  return (
    <div className="max-w-2xl">
      <Link href="/owner/prescriptions" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-blue-600 mb-4">
        <ArrowLeft className="size-4" /> Back
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-6">
        <h1 className="text-2xl font-bold">{rx.medication}</h1>
        <p className="text-slate-500">{rx.dosage}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div><dt className="text-slate-500">Pet</dt><dd className="font-medium">{rx.petName}</dd></div>
          <div><dt className="text-slate-500">Vet</dt><dd className="font-medium">{rx.vetName}</dd></div>
          <div><dt className="text-slate-500">Issued</dt><dd className="font-medium">{new Date(rx.issuedAt).toLocaleDateString()}</dd></div>
          <div><dt className="text-slate-500">Duration</dt><dd className="font-medium">{rx.durationDays} days</dd></div>
          <div className="col-span-2"><dt className="text-slate-500">Instructions</dt><dd className="font-medium">{rx.instructions}</dd></div>
        </dl>

        <a href={`/api/prescriptions/${rx._id}/pdf`} className="mt-6 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <Download className="size-4" /> Download PDF
        </a>
      </div>
    </div>
  );
}
