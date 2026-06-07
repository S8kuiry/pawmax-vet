import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/auth";
import Booking from "@/models/Booking";
import Message from "@/models/Message";
import Thread from "@/models/Thread";
import { formatMessageForClient } from "@/lib/message-format";

async function syncThread(
  booking: { vetId: unknown; ownerId: unknown; petId?: unknown },
  text: string,
  senderRole: "vet" | "owner",
) {
  const thread = await Thread.findOne({
    vetId: booking.vetId,
    ownerId: booking.ownerId,
    petId: booking.petId,
  });
  if (!thread) return;

  thread.lastMessage = text.slice(0, 200);
  thread.lastMessageAt = new Date();
  if (senderRole === "vet") {
    thread.unreadForOwner = (thread.unreadForOwner ?? 0) + 1;
  } else {
    thread.unreadForVet = (thread.unreadForVet ?? 0) + 1;
  }
  await thread.save();
}

const Msg = z.object({ text: z.string().min(1).max(4000) });

function isBookingParty(
  booking: { vetId: unknown; ownerId: unknown },
  userId: string,
) {
  return [String(booking.vetId), String(booking.ownerId)].includes(userId);
}

export async function GET(_: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await requireRole(["owner", "vet"]);
  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await dbConnect();
  const booking = await Booking.findById(id).lean();
  if (!booking || !isBookingParty(booking, s.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await Message.find({
    booking: id,
    deletedAt: { $exists: false },
  })
    .sort({ createdAt: 1 })
    .limit(500)
    .lean();

  return NextResponse.json({
    messages: messages.map((m) => formatMessageForClient(m)),
  });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const s = await requireRole(["owner", "vet"]);
  const { text } = Msg.parse(await req.json());

  if (!isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await dbConnect();
  const booking = await Booking.findById(id);
  if (!booking || !isBookingParty(booking, s.id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const message = await Message.create({
    booking: booking._id,
    sender: s.id,
    senderRole: s.role as "owner" | "vet",
    kind: "text",
    text,
    readBy: [s.id],
  });

  await syncThread(booking, text, s.role as "owner" | "vet");

  return NextResponse.json({
    ok: true,
    message: formatMessageForClient(message),
  });
}
