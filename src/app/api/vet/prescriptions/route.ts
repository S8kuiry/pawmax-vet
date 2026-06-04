import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Prescription from "@/models/Prescription";
import Pet from "@/models/Pet";
const querySchema = z.object({
  petId: z.string().optional(),
  status: z.enum(["active", "completed", "cancelled"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
const createSchema = z.object({
  petId: z.string().min(1),
  bookingId: z.string().optional(),
  drug: z.string().min(1).max(200),
  strength: z.string().max(80).optional(),
  form: z.string().max(40).optional(),
  dose: z.string().min(1).max(200),
  frequency: z.string().max(120).optional(),
  durationDays: z.number().int().min(0).max(365).optional(),
  route: z.string().max(40).optional(),
  quantity: z.number().int().min(0).optional(),
  refills: z.number().int().min(0).max(20).optional(),
  instructions: z.string().max(2000).optional(),
  expiresAt: z.string().datetime().optional(),
});
export async function GET(req: Request) {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  await dbConnect();
  const q: Record<string, unknown> = { vetId: guard.session.id };
  if (parsed.data.petId) q.petId = parsed.data.petId;
  if (parsed.data.status) q.status = parsed.data.status;
  const prescriptions = await Prescription.find(q)
    .sort({ issuedAt: -1 })
    .limit(parsed.data.limit ?? 50)
    .lean();
  return NextResponse.json({ prescriptions });
}
export async function POST(req: Request) {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  await dbConnect();
  const pet = await Pet.findById(parsed.data.petId).lean<any>();
  if (!pet) return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  const prescription = await Prescription.create({
    ...parsed.data,
    vetId: guard.session.id,
    ownerId: pet.ownerId,
    expiresAt: parsed.data.expiresAt ? new Date(parsed.data.expiresAt) : undefined,
  });
  return NextResponse.json({ prescription }, { status: 201 });
}
