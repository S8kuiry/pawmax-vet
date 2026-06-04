import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireVet } from "@/lib/vet-auth";
import Thread from "@/models/Thread";
import Message from "@/models/Message";
import Booking from "@/models/Booking";

const postSchema = z.object({
  body: z.string().min(1).max(4000),
  text: z.string().min(1).max(4000).optional(),
  attachments: z
    .array(z.object({
      url: z.string().url(),
      name: z.string().max(200).optional(),
      mimeType: z.string().max(120).optional(),
    }))
    .max(10)
    .optional(),
});

async function bookingForThread(thread: { vetId: unknown; ownerId: unknown; petId?: unknown }) {
  const q: Record<string, unknown> = {
    vetId: thread.vetId,
    ownerId: thread.ownerId,
  };
  if (thread.petId) q.petId = thread.petId;
  return Booking.findOne(q).sort({ startAt: -1 });
}

export async function GET(_req: Request, ctx: { params: Promise<{ threadId: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.threadId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  await dbConnect();
  const thread = await Thread.findOne({ _id: params.threadId, vetId: guard.session.id }).lean();
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const booking = await bookingForThread(thread as { vetId: unknown; ownerId: unknown; petId?: unknown });
  const messages = booking
    ? await Message.find({ booking: booking._id }).sort({ createdAt: 1 }).limit(500).lean()
    : [];

  await Thread.updateOne({ _id: params.threadId }, { $set: { unreadForVet: 0 } });
  if (booking) {
    await Message.updateMany(
      { booking: booking._id, senderRole: "owner" },
      { $addToSet: { readBy: guard.session.id } },
    );
  }

  return NextResponse.json({ thread, messages, bookingId: booking?._id ?? null });
}

export async function POST(req: Request, ctx: { params: Promise<{ threadId: string }> }) {
  const params = await ctx.params;
  const guard = await requireVet();
  if (guard instanceof NextResponse) return guard;
  if (!isValidObjectId(params.threadId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = postSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  const text = parsed.data.text ?? parsed.data.body;
  await dbConnect();
  const thread = await Thread.findOne({ _id: params.threadId, vetId: guard.session.id });
  if (!thread) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const booking = await bookingForThread(thread);
  if (!booking) {
    return NextResponse.json({ error: "No booking found for this conversation" }, { status: 404 });
  }

  const message = await Message.create({
    booking: booking._id,
    sender: guard.session.id,
    senderRole: "vet",
    kind: "text",
    text,
    attachments: parsed.data.attachments ?? [],
    readBy: [guard.session.id],
  });

  thread.lastMessage = text.slice(0, 200);
  thread.lastMessageAt = new Date();
  thread.unreadForOwner = (thread.unreadForOwner ?? 0) + 1;
  await thread.save();

  return NextResponse.json({ message }, { status: 201 });
}
