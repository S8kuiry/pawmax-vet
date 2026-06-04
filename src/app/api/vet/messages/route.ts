import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Thread from "@/models/Thread";
export async function GET() {
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  await dbConnect();
  const threads = await Thread.find({ vetId: guard.session.id })
    .sort({ lastMessageAt: -1 })
    .limit(100)
    .populate("ownerId", "name email")
    .populate("petId", "name species")
    .lean();
  return NextResponse.json({ threads });
}