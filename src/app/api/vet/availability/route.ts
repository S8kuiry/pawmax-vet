import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Availability from "@/models/Availability";
const dayHours = z.object({
  day: z.number().int().min(0).max(6),
  open: z.boolean(),
  start: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  end: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  breaks: z
    .array(z.object({ start: z.string(), end: z.string() }))
    .max(5)
    .optional(),
});
const upsertSchema = z.object({
  timezone: z.string().max(60).optional(),
  slotMinutes: z.number().int().min(10).max(240).optional(),
  weeklyHours: z.array(dayHours).max(7).optional(),
  blackouts: z
    .array(z.object({ date: z.string().datetime(), reason: z.string().max(200).optional() }))
    .max(365)
    .optional(),
});
export async function GET() {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  await dbConnect();
  const doc =
    (await Availability.findOne({ vetId: guard.session.id }).lean()) ||
    { vetId: guard.session.id, weeklyHours: [], blackouts: [], slotMinutes: 30, timezone: "UTC" };
  return NextResponse.json({ availability: doc });
}
export async function PUT(req: Request) {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  await dbConnect();
  const doc = await Availability.findOneAndUpdate(
    { vetId: guard.session.id },
    { $set: parsed.data, $setOnInsert: { vetId: guard.session.id } },
    { upsert: true, new: true, runValidators: true },
  ).lean();
  return NextResponse.json({ availability: doc });
}
