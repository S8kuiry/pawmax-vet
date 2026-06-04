import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export async function GET(_req: Request, ctx: { params: Promise<{ vetId: string }> }) {
  const { vetId } = await ctx.params;
  await dbConnect();
  const vet = await User.findOne({ _id: vetId, role: "vet" })
    .select("name email specialty licenseNumber kycStatus")
    .lean();
  if (!vet) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ vet });
}
