import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Service from "@/models/Service";
const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(1000).optional(),
  durationMinutes: z.number().int().min(5).max(480).optional(),
  priceCents: z.number().int().min(0).optional(),
  currency: z.string().length(3).optional(),
  mode: z.enum(["in-person", "video", "either"]).optional(),
  active: z.boolean().optional(),
});
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await dbConnect();
  const service = await Service.findOne({ _id: params.id, vetId: guard.session.id }).lean();
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ service });
}
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }
  await dbConnect();
  const service = await Service.findOneAndUpdate(
    { _id: params.id, vetId: guard.session.id },
    parsed.data,
    { new: true, runValidators: true },
  ).lean();
  if (!service) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ service });
}
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await dbConnect();
  const res = await Service.deleteOne({ _id: params.id, vetId: guard.session.id });
  if (res.deletedCount === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}