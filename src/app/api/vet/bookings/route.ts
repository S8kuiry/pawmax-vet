import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Booking from "@/models/Booking";
import Pet from "@/models/Pet";
import User from "@/models/User";
import Service from "@/models/Service";
const querySchema = z.object({
  status: z
    .enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "declined", "no_show"])
    .optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});
const createSchema = z.object({
  ownerId: z.string().min(1),
  petId: z.string().min(1),
  serviceId: z.string().optional(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  mode: z.enum(["in-person", "video"]).optional(),
  reason: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  priceCents: z.number().int().min(0).optional(),
  status: z
    .enum(["pending", "confirmed", "in_progress", "completed", "cancelled", "declined", "no_show"])
    .optional(),
});
export async function GET(req: Request) {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", issues: parsed.error.flatten() }, { status: 400 });
  }
  await dbConnect();
  const q: Record<string, unknown> = { vetId: guard.session.id };
  if (parsed.data.status) q.status = parsed.data.status;
  if (parsed.data.from || parsed.data.to) {
    q.startAt = {};
    if (parsed.data.from) (q.startAt as any).$gte = new Date(parsed.data.from);
    if (parsed.data.to) (q.startAt as any).$lte = new Date(parsed.data.to);
  }
  const bookings = await Booking.find(q)
    .sort({ startAt: 1 })
    .limit(parsed.data.limit ?? 100)
    .lean();
  return NextResponse.json({ bookings });
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
  if (new Date(parsed.data.endAt) <= new Date(parsed.data.startAt)) {
    return NextResponse.json({ error: "endAt must be after startAt" }, { status: 400 });
  }
  await dbConnect();
  const [pet, owner, service] = await Promise.all([
    Pet.findById(parsed.data.petId).lean<any>(),
    User.findById(parsed.data.ownerId).select("name").lean<any>(),
    parsed.data.serviceId ? Service.findById(parsed.data.serviceId).lean<any>() : Promise.resolve(null),
  ]);
  if (!pet) return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  if (!owner) return NextResponse.json({ error: "Owner not found" }, { status: 404 });
  const booking = await Booking.create({
    vetId: guard.session.id,
    ownerId: parsed.data.ownerId,
    petId: parsed.data.petId,
    serviceId: parsed.data.serviceId,
    startAt: new Date(parsed.data.startAt),
    endAt: new Date(parsed.data.endAt),
    mode: parsed.data.mode ?? service?.mode ?? "in-person",
    reason: parsed.data.reason ?? "",
    notes: parsed.data.notes ?? "",
    priceCents: parsed.data.priceCents ?? service?.priceCents ?? 0,
    status: parsed.data.status ?? "confirmed",
    patientName: pet.name,
    ownerName: owner.name,
  });
  return NextResponse.json({ booking }, { status: 201 });
}