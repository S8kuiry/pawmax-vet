import { NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Pet from "@/models/Pet";
import Booking from "@/models/Booking";
import MedicalRecord from "@/models/MedicalRecord";
import Prescription from "@/models/Prescription";
import User from "@/models/User";
export async function GET(_req: Request, ctx: { params: Promise<{ petId: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.petId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await dbConnect();
  // Vet may only view pets they've treated at least once.
  const hasAccess = await Booking.exists({
    vetId: guard.session.id,
    petId: params.petId,
  });
  if (!hasAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const pet = await Pet.findById(params.petId).lean<any>();
  if (!pet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const [owner, history, prescriptions, bookings] = await Promise.all([
    User.findById(pet.ownerId).select("name email phone").lean(),
    MedicalRecord.find({ petId: params.petId }).sort({ date: -1 }).limit(100).lean(),
    Prescription.find({ petId: params.petId }).sort({ issuedAt: -1 }).limit(50).lean(),
    Booking.find({ petId: params.petId, vetId: guard.session.id })
      .sort({ startAt: -1 })
      .limit(50)
      .lean(),
  ]);
  return NextResponse.json({ pet, owner, history, prescriptions, bookings });
}
