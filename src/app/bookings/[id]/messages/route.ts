import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import ConsultationRoom from "@/models/ConsultationRoom";

const Msg = z.object({ text: z.string().min(1).max(2000) });

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await requireRole(["owner","vet"]);
  await dbConnect();
  const room = await ConsultationRoom.findOne({ bookingId: id }).lean();
  if (!room) return NextResponse.json({ messages: [] });
  if (![String((room as any).ownerId), String((room as any).vetId)].includes(s.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json({ messages: (room as any).messages });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await requireRole(["owner","vet"]);
  const { text } = Msg.parse(await req.json());
  await dbConnect();
  const room = await ConsultationRoom.findOne({ bookingId: id });
  if (!room) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (![String(room.ownerId), String(room.vetId)].includes(s.id))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  room.messages.push({ senderId: s.id as any, senderRole: s.role as any, text, at: new Date() } as any);
  await room.save();
  return NextResponse.json({ ok: true, message: room.messages[room.messages.length - 1] });
}
