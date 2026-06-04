import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Pet from "@/models/Pet";

const PetCreate = z.object({
  name: z.string().min(1).max(60),
  species: z.enum(["Dog","Cat","Rabbit","Bird","Reptile","Other"]),
  breed: z.string().max(80).optional(),
  sex: z.enum(["male","female","unknown"]).optional(),
  dob: z.string().datetime().optional(),
  weightKg: z.number().min(0).max(200).optional(),
  color: z.string().max(40).optional(),
  photoUrl: z.string().url().optional(),
  notes: z.string().max(2000).optional(),
});

export async function GET() {
  const s = await requireRole(["owner","vet","admin"]);
  await dbConnect();
  const filter = s.role === "owner" ? { ownerId: s.id } : {};
  const pets = await Pet.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ pets });
}

export async function POST(req: NextRequest) {
  const s = await requireRole("owner");
  const body = PetCreate.parse(await req.json());
  await dbConnect();
  const pet = await Pet.create({ ...body, ownerId: s.id });
  return NextResponse.json({ pet }, { status: 201 });
}
