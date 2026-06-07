import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Pet from "@/models/Pet";

const PetUpdate = z.object({
  name: z.string().min(1).max(80).optional(),
  species: z.enum(["Dog", "Cat", "Rabbit", "Bird", "Reptile", "Other"]).optional(), // Added missing field
  breed: z.string().max(80).optional(),
  sex: z.enum(["male", "female", "unknown"]).optional(),
  birthDate: z.string().trim().optional(), // Changed from .datetime() to plain string to accept YYYY-MM-DD
  weightKg: z.number().min(0).max(500).optional(), // Updated max to 500 to align with Mongoose
  color: z.string().max(40).optional(),
  photoUrl: z.string().url().or(z.literal("")).optional(), // Handles empty string variations
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
  
  const json = await req.json();
  const parsed = PetUpdate.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid data", details: parsed.error }, { status: 400 });
  }

  // Since your Zod schema and Schema both use 'birthDate' and 'sex', 
  // you can pass the parsed data directly to the update object.
  const updateData = parsed.data;

  // Handle Date conversion if birthDate is provided
  // Note: z.string().datetime() expects an ISO string
  const updatePayload: any = { ...updateData };
  if (updateData.birthDate) {
    updatePayload.birthDate = new Date(updateData.birthDate);
  }

  await dbConnect();

  const pet = await Pet.findOneAndUpdate(
    { _id: id, ownerId: s.id },
    { $set: updatePayload },
    { new: true }
  );

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
