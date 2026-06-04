import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";

const Body = z.object({
  decision: z.enum(["approved", "rejected"]),
  reason: z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("admin");
  const { id } = await params;
  const { decision } = Body.parse(await req.json());
  await dbConnect();

  const kycStatus = decision === "approved" ? "verified" : "rejected";
  const user = await User.findOneAndUpdate(
    { _id: id, role: "vet" },
    { kycStatus },
    { new: true }
  ).select("name email kycStatus");

  if (!user) {
    return NextResponse.json({ error: "Vet not found" }, { status: 404 });
  }

  return NextResponse.json({ vet: user });
}
