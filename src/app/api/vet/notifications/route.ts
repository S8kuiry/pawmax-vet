import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Notification from "@/models/Notification";
const patchSchema = z.object({
  ids: z.array(z.string().min(1)).max(500).optional(),
  all: z.boolean().optional(),
});
export async function GET() {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  await dbConnect();
  const items = await Notification.find({ userId: guard.session.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  const unread = await Notification.countDocuments({
    userId: guard.session.id,
    readAt: null,
  });
  return NextResponse.json({ items, unread });
}
export async function PATCH(req: Request) {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  await dbConnect();
  const filter: Record<string, unknown> = { userId: guard.session.id };
  if (!parsed.data.all) {
    if (!parsed.data.ids?.length) {
      return NextResponse.json({ error: "ids or all required" }, { status: 400 });
    }
    filter._id = { $in: parsed.data.ids };
  }
  const res = await Notification.updateMany(filter, { $set: { readAt: new Date() } });
  return NextResponse.json({ updated: res.modifiedCount });
}
