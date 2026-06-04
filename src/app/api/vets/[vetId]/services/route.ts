import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Service from "@/models/Service";

export async function GET(_req: Request, ctx: { params: Promise<{ vetId: string }> }) {
  const { vetId } = await ctx.params;
  await dbConnect();
  const services = await Service.find({ vetId }).lean();
  return NextResponse.json({ services });
}
