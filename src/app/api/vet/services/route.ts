import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Service from "@/models/Service";
const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(1000).optional(),
  durationMinutes: z.number().int().min(5).max(480),
  priceCents: z.number().int().min(0),
  currency: z.string().length(3).optional(),
  mode: z.enum(["in-person", "video", "either"]).optional(),
  active: z.boolean().optional(),
});
export async function GET() {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  await dbConnect();
  const services = await Service.find({ vetId: guard.session.id })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ services });
}
export async function POST(req: Request) {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
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
  await dbConnect();
  const service = await Service.create({ ...parsed.data, vetId: guard.session.id });
  return NextResponse.json({ service }, { status: 201 });
}