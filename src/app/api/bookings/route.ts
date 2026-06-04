import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { getSession, requireRole } from "@/lib/auth";
import Booking from "@/models/Booking";
import Pet from "@/models/Pet";
import User from "@/models/User";

const createSchema = z.object({
  vetId: z.string().min(1),
  petId: z.string().min(1),
  startAt: z.string().datetime(),
  endAt: z.string().datetime().optional(),
  mode: z.enum(["in-person", "video"]).optional(),
  reason: z.string().max(500).optional(),
});

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();
  const url = new URL(req.url);
  const status = url.searchParams.get("status");

  const q: Record<string, unknown> =
    session.role === "vet" ? { vetId: session.id } : { ownerId: session.id };
  if (status) q.status = status;

  const bookings = await Booking.find(q).sort({ startAt: -1 }).limit(100).lean();
  return NextResponse.json({ bookings });
}

export async function POST(req: NextRequest) {
  const session = await requireRole("owner");
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const startAt = new Date(parsed.data.startAt);
  const endAt = parsed.data.endAt
    ? new Date(parsed.data.endAt)
    : new Date(startAt.getTime() + 30 * 60 * 1000);
  if (endAt <= startAt) {
    return NextResponse.json({ error: "endAt must be after startAt" }, { status: 400 });
  }

  await dbConnect();

  const [pet, vet] = await Promise.all([
    Pet.findOne({ _id: parsed.data.petId, ownerId: session.id }).lean(),
    User.findOne({ _id: parsed.data.vetId, role: "vet" }).select("name").lean(),
  ]);
  if (!pet) return NextResponse.json({ error: "Pet not found" }, { status: 404 });
  if (!vet) return NextResponse.json({ error: "Vet not found" }, { status: 404 });

  const owner = await User.findById(session.id).select("name").lean();

  const booking = await Booking.create({
    vetId: parsed.data.vetId,
    ownerId: session.id,
    petId: parsed.data.petId,
    startAt,
    endAt,
    mode: parsed.data.mode ?? "video",
    reason: parsed.data.reason ?? "",
    status: "pending",
    patientName: pet.name,
    ownerName: owner?.name ?? session.email,
    priceCents: 0,
  });

  return NextResponse.json({ booking }, { status: 201 });
}
