import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Availability from "@/models/Availability";

export async function GET(_req: Request, ctx: { params: Promise<{ vetId: string }> }) {
  const { vetId } = await ctx.params;
  await dbConnect();
  const doc = await Availability.findOne({ vetId }).lean();
  return NextResponse.json({
    availability: doc ?? { vetId, weeklyHours: [], blackouts: [], slotMinutes: 30 },
  });
}
