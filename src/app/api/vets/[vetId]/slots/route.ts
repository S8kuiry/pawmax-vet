import { NextRequest, NextResponse } from "next/server";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Slot from "@/models/Slot";
import { findVetById } from "@/lib/vet-resolve";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ vetId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { vetId } = await ctx.params;
  if (!isValidObjectId(vetId)) {
    return NextResponse.json({ error: "Invalid vet id" }, { status: 400 });
  }

  await dbConnect();

  const vet = await findVetById(vetId);
  if (!vet) {
    return NextResponse.json({ error: "Vet not found" }, { status: 404 });
  }

  const url = new URL(req.url);
  const fromParam = url.searchParams.get("from");
  const toParam = url.searchParams.get("to");

  const from = fromParam ? new Date(fromParam) : new Date();
  from.setHours(0, 0, 0, 0);

  const to = toParam
    ? new Date(toParam)
    : new Date(from.getTime() + 30 * 24 * 60 * 60 * 1000);

  const slots = await Slot.find({
    vetId,
    status: "available",
    startTime: { $gte: from, $lte: to },
  })
    .sort({ startTime: 1 })
    .select("_id startTime endTime status")
    .lean();

  return NextResponse.json({ vetId, slots });
}
