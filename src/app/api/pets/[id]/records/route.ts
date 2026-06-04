import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Pet from "@/models/Pet";
import MedicalRecord from "@/models/MedicalRecord";

const RecordCreate = z.object({
  type: z.enum(["Visit","Vaccine","Surgery","Lab","Prescription","Note"]),
  summary: z.string().min(1).max(200),
  notes: z.string().max(4000).optional(),
  date: z.string().datetime().optional(),
  bookingId: z.string().optional(),
  prescription: z.array(z.object({
    drug: z.string(), dose: z.string(), frequency: z.string(), durationDays: z.number().int().min(1).max(365),
  })).optional(),
});

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await requireRole(["owner","vet","admin"]);
  await dbConnect();
  const pet = await Pet.findById(id).lean();
  if (!pet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (s.role === "owner" && String((pet as any).ownerId) !== s.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const records = await MedicalRecord.find({ petId: id }).sort({ date: -1 }).lean();
  return NextResponse.json({ records });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await requireRole("vet"); // only vets write records
  const body = RecordCreate.parse(await req.json());
  await dbConnect();
  const rec = await MedicalRecord.create({ ...body, petId: id, vetId: s.id });
  return NextResponse.json({ record: rec }, { status: 201 });
}
