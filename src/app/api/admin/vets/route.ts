import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import User from "@/models/User";

export async function GET() {
  await requireRole("admin");
  await dbConnect();
  const vets = await User.find({ role: "vet" })
    .select("name email kycStatus specialty licenseNumber createdAt")
    .sort({ createdAt: -1 }).lean();
  return NextResponse.json({ vets });
}
