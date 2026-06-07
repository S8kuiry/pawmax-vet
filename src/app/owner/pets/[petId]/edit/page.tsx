import { notFound } from "next/navigation";
import { dbConnect } from "@/lib/db";
import Pet from "@/models/Pet";
import { getSession } from "@/lib/auth";
import EditPetForm from "./EditPetForm/page";

interface EditPageProps {
  params: Promise<{ petId: string }>;
}

// Resilient UTC date string formatter to prevent local timezone shifts
function formatDateToInput(dateInput: any): string {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";
  
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`; // Strictly returns YYYY-MM-DD
}

export default async function EditPetPage({ params }: EditPageProps) {
  const { petId } = await params;
  const session = await getSession();
  
  await dbConnect();
  
  // Fetch document securely scoped to authenticated owner
  const petDoc = await Pet.findOne({ _id: petId, ownerId: session!.id }).lean();
  
  if (!petDoc) {
    notFound();
  }

  // Normalize document to safe string properties for client components
  const petData = {
    id: String(petDoc._id),
    name: String(petDoc.name),
    species: String(petDoc.species),
    breed: petDoc.breed ? String(petDoc.breed) : "",
    birthDate: formatDateToInput(petDoc.birthDate), // Safely converted
    weightKg: petDoc.weightKg ? Number(petDoc.weightKg) : undefined,
    gender: petDoc.sex ? String(petDoc.sex) : "unknown",
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 w-full py-10 px-6 md:px-8 lg:px-12 antialiased flex flex-col items-center">
      <div className="w-full max-w-2xl space-y-6">
        
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-600 block mb-1">
            Data Core / Profiles
          </span>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Edit Profile: <span className="text-blue-600">{petData.name}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Modify health parameters, species categorization, and operational records saved inside the matrix.
          </p>
        </div>

        <EditPetForm pet={petData} />

      </div>
    </div>
  );
}