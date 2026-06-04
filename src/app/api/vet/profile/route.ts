import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import User from "@/models/User";
const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().min(5).max(30).optional().or(z.literal("")),
  bio: z.string().max(2000).optional().or(z.literal("")),
  clinicName: z.string().max(200).optional().or(z.literal("")),
  clinicAddress: z.string().max(300).optional().or(z.literal("")),
  licenseNumber: z.string().max(120).optional().or(z.literal("")),
  licenseExpiresAt: z.string().datetime().optional().or(z.literal("")),
  specialties: z.array(z.string().min(1).max(60)).max(20).optional(),
  yearsExperience: z.number().min(0).max(80).optional(),
  consultFeeCents: z.number().min(0).max(1_000_000).optional(),
  videoEnabled: z.boolean().optional(),
  inPersonEnabled: z.boolean().optional(),
  photoUrl: z.string().url().max(500).optional().or(z.literal("")),
});
export async function GET() {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  await dbConnect();
  const user = await User.findById(guard.session.id).select("-password").lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}
export async function PATCH(req: Request) {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  await dbConnect();
  const user = await User.findByIdAndUpdate(guard.session.id, parsed.data, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ user });
}