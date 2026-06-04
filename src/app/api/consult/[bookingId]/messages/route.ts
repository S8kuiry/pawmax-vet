import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Booking from "@/models/Booking";
import Thread from "@/models/Thread";
import Message from "@/models/Message";
import { formatMessageForClient } from "@/lib/message-format";

const postSchema = z.object({
  text: z.string().min(1).max(4000),
  body: z.string().min(1).max(4000).optional(),
});

function isBookingParty(
  booking: { vetId: unknown; ownerId: unknown },
  userId: string,
) {
  return [String(booking.vetId), String(booking.ownerId)].includes(userId);
}

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

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ bookingId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookingId } = await ctx.params;
  if (!isValidObjectId(bookingId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  await dbConnect();
  const booking = await Booking.findById(bookingId).lean();
  if (!booking || !isBookingParty(booking, session.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const messages = await Message.find({
    booking: bookingId,
    deletedAt: { $exists: false },
  })
    .sort({ createdAt: 1 })
    .limit(500)
    .lean();

  const thread = await Thread.findOne({
    vetId: booking.vetId,
    ownerId: booking.ownerId,
    petId: booking.petId,
  });

  if (thread) {
    const unreadField = session.role === "vet" ? "unreadForVet" : "unreadForOwner";
    await Thread.updateOne({ _id: thread._id }, { $set: { [unreadField]: 0 } });

    const otherRole = session.role === "vet" ? "owner" : "vet";
    await Message.updateMany(
      { booking: bookingId, senderRole: otherRole },
      { $addToSet: { readBy: session.id } },
    );
  }

  return NextResponse.json({
    messages: messages.map((m) => formatMessageForClient(m)),
  });
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ bookingId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "vet" && session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { bookingId } = await ctx.params;
  if (!isValidObjectId(bookingId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const text = parsed.data.text ?? parsed.data.body!;
  await dbConnect();

  const booking = await Booking.findById(bookingId);
  if (!booking || !isBookingParty(booking, session.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const message = await Message.create({
    booking: booking._id,
    sender: session.id,
    senderRole: session.role,
    kind: "text",
    text,
    readBy: [session.id],
  });

  await syncThread(booking, text, session.role);

  return NextResponse.json(
    { message: formatMessageForClient(message) },
    { status: 201 },
  );
}
