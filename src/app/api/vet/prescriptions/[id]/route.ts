import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Prescription from "@/models/Prescription";
const updateSchema = z.object({
  status: z.enum(["active", "completed", "cancelled"]).optional(),
  instructions: z.string().max(2000).optional(),
  refills: z.number().int().min(0).max(20).optional(),
});
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await dbConnect();
  const prescription = await Prescription.findOne({ _id: params.id, vetId: guard.session.id }).lean();
  if (!prescription) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ prescription });
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
  const prescription = await Prescription.findOneAndUpdate(
    { _id: params.id, vetId: guard.session.id },
    parsed.data,
    { new: true, runValidators: true },
  ).lean();
  if (!prescription) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ prescription });
}
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  await dbConnect();
  const prescription = await Prescription.findOneAndUpdate(
    { _id: params.id, vetId: guard.session.id },
    { status: "cancelled" },
    { new: true },
  ).lean();
  if (!prescription) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ prescription });
}
