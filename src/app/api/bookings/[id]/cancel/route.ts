import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Booking from "@/models/Booking";

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  const { id } = await ctx.params;
  await dbConnect();

  const q =
    session.role === "vet"
      ? { _id: id, vetId: session.id }
      : { _id: id, ownerId: session.id };

  await Booking.findOneAndUpdate(q, { status: "cancelled" });
  return NextResponse.redirect(new URL("/owner/bookings?tab=cancelled", req.url));
}
