import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Pet from "@/models/Pet";

const PetUpdate = z.object({
  name: z.string().min(1).max(60).optional(),
  breed: z.string().max(80).optional(),
  sex: z.enum(["male","female","unknown"]).optional(),
  dob: z.string().datetime().optional(),
  weightKg: z.number().min(0).max(200).optional(),
  color: z.string().max(40).optional(),
  photoUrl: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await requireRole(["owner","vet","admin"]);
  await dbConnect();
  const pet = await Pet.findById(id).lean();
  if (!pet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (s.role === "owner" && String((pet as any).ownerId) !== s.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ pet });
}

export async function PATCH(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await requireRole("owner");
  const body = PetUpdate.parse(await req.json());
  await dbConnect();
  const pet = await Pet.findOneAndUpdate({ _id: id, ownerId: s.id }, body, { new: true });
  if (!pet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ pet });
}

export async function DELETE(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await requireRole("owner");
  await dbConnect();
  const r = await Pet.deleteOne({ _id: id, ownerId: s.id });
  if (!r.deletedCount) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
