import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import MedicalRecord from "@/models/MedicalRecord";
import Pet from "@/models/Pet";
const querySchema = z.object({
  petId: z.string().optional(),
  type: z.enum(["soap", "vaccine", "lab", "surgery", "imaging", "note"]).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
const createSchema = z.object({
  petId: z.string().min(1),
  bookingId: z.string().optional(),
  type: z.enum(["soap", "vaccine", "lab", "surgery", "imaging", "note"]).default("soap"),
  date: z.string().datetime().optional(),
  summary: z.string().max(500).optional(),
  body: z.string().max(10000).optional(),
  subjective: z.string().max(5000).optional(),
  objective: z.string().max(5000).optional(),
  assessment: z.string().max(5000).optional(),
  plan: z.string().max(5000).optional(),
  vaccineName: z.string().max(120).optional(),
  vaccineLot: z.string().max(80).optional(),
  vaccineExpiresAt: z.string().datetime().optional(),
  attachments: z
    .array(z.object({
      url: z.string().url(),
      name: z.string().max(200).optional(),
      mimeType: z.string().max(120).optional(),
      sizeBytes: z.number().int().min(0).optional(),
    }))
    .max(20)
    .optional(),
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
  if (parsed.data.type) q.type = parsed.data.type;
  const records = await MedicalRecord.find(q)
    .sort({ date: -1 })
    .limit(parsed.data.limit ?? 50)
    .lean();
  return NextResponse.json({ records });
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
  const record = await MedicalRecord.create({
    ...parsed.data,
    vetId: guard.session.id,
    ownerId: pet.ownerId,
    date: parsed.data.date ? new Date(parsed.data.date) : new Date(),
    vaccineExpiresAt: parsed.data.vaccineExpiresAt
      ? new Date(parsed.data.vaccineExpiresAt)
      : undefined,
  });
  return NextResponse.json({ record }, { status: 201 });
}
