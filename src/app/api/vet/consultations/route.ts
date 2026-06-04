import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Consultation from "@/models/Consultation";
const querySchema = z.object({
  status: z.enum(["queued", "live", "ended", "cancelled"]).optional(),
});
export async function GET(req: Request) {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  const url = new URL(req.url);
  const parsed = querySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query" }, { status: 400 });
  }
  await dbConnect();
  const q: Record<string, unknown> = { vetId: guard.session.id };
  if (parsed.data.status) q.status = parsed.data.status;
  else q.status = { $in: ["queued", "live"] };
  const consultations = await Consultation.find(q).sort({ createdAt: 1 }).lean();
  return NextResponse.json({ consultations });
}