import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Booking from "@/models/Booking";

type Params = { params: Promise<{ id: string }> };

async function findAuthorizedBooking(id: string, session: { id: string; role: string }) {
  await dbConnect();
  const q =
    session.role === "vet"
      ? { _id: id, vetId: session.id }
      : session.role === "admin"
        ? { _id: id }
        : { _id: id, ownerId: session.id };
  return Booking.findOne(q).lean();
}

export async function GET(_req: NextRequest, ctx: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  const booking = await findAuthorizedBooking(id, session);
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ booking });
}

export async function PATCH(req: NextRequest, ctx: Params) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await ctx.params;
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await dbConnect();
  const q =
    session.role === "vet"
      ? { _id: id, vetId: session.id }
      : { _id: id, ownerId: session.id };

  const booking = await Booking.findOneAndUpdate(
    q,
    { status: body.status },
    { new: true },
  ).lean();

  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ booking });
}
