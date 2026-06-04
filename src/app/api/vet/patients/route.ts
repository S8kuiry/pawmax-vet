import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Booking from "@/models/Booking";
import Pet from "@/models/Pet";
/**
 * Lists distinct pets this vet has ever treated (any booking).
 */
export async function GET() {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  await dbConnect();
  const petIds: any[] = await Booking.distinct("petId", { vetId: guard.session.id });
  const patients = await Pet.find({ _id: { $in: petIds } })
    .sort({ name: 1 })
    .lean();
  return NextResponse.json({ patients });
}
