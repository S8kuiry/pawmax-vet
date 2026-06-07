import { isValidObjectId } from "mongoose";
import type { SessionUser } from "@/lib/auth";
import Booking from "@/models/Booking";
import Thread from "@/models/Thread";
import Consultation from "@/models/Consultation";
import Message from "@/models/Message";
import { notifyBookingEvent } from "@/lib/notifications";

const ACTIVE_STATUSES = ["confirmed", "in_progress"] as const;

export function jitsiRoomName(bookingId: string) {
  return `petcare-${bookingId}`;
}

export async function loadConsultBooking(bookingId: string, session: SessionUser) {
  if (!isValidObjectId(bookingId)) return null;

  const q =
    session.role === "vet"
      ? { _id: bookingId, vetId: session.id }
      : session.role === "owner"
        ? { _id: bookingId, ownerId: session.id }
        : null;

  if (!q) return null;

  const booking = await Booking.findOne(q).lean();
  if (!booking) return null;

  const status = booking.status as string;
  if (!ACTIVE_STATUSES.includes(status as (typeof ACTIVE_STATUSES)[number])) {
    return { booking, blocked: true as const, reason: "inactive" as const };
  }

  if (booking.mode !== "video") {
    return { booking, blocked: true as const, reason: "not_video" as const };
  }

  return { booking, blocked: false as const };
}

export async function ensureConsultThread(booking: Record<string, unknown>) {
  let thread = await Thread.findOne({
    vetId: booking.vetId,
    ownerId: booking.ownerId,
    petId: booking.petId,
  });

  if (!thread) {
    thread = await Thread.create({
      vetId: booking.vetId,
      ownerId: booking.ownerId,
      petId: booking.petId,
    });
  }

  return thread;
}

async function ensureWelcomeMessage(bookingId: unknown) {
  const id = String(bookingId);
  const count = await Message.countDocuments({ booking: id });
  if (count > 0) return;

  await Message.create({
    booking: id,
    senderRole: "system",
    kind: "system",
    text: "Consultation started. Use chat here during your video call.",
  });
}

/** Mark booking live and upsert a Consultation record for vet dashboards. */
export async function markConsultationLive(booking: Record<string, unknown>) {
  if (booking.status !== "in_progress") {
    await Booking.findByIdAndUpdate(booking._id, { status: "in_progress" });
    booking.status = "in_progress";
  }

  const roomUrl = `jitsi:${jitsiRoomName(String(booking._id))}`;

  let consultation = await Consultation.findOne({ bookingId: booking._id });
  if (!consultation) {
    consultation = await Consultation.create({
      bookingId: booking._id,
      vetId: booking.vetId,
      ownerId: booking.ownerId,
      petId: booking.petId,
      mode: booking.mode ?? "video",
      status: "live",
      roomUrl,
      startedAt: new Date(),
    });
  } else {
    if (consultation.status !== "live") {
      consultation.status = "live";
      consultation.startedAt = consultation.startedAt ?? new Date();
    }
    if (!consultation.roomUrl) consultation.roomUrl = roomUrl;
    await consultation.save();
  }

  await ensureWelcomeMessage(booking._id);
  return consultation;
}

/** Vet completes a consultation; either party can leave without completing. */
export async function endConsultation(
  bookingId: string,
  session: SessionUser,
  options: { complete?: boolean } = {},
) {
  const result = await loadConsultBooking(bookingId, session);
  if (!result || result.blocked) return { ok: false as const, reason: "blocked" as const };

  const consultation = await Consultation.findOne({ bookingId: result.booking._id });
  if (!consultation) return { ok: false as const, reason: "missing" as const };

  if (options.complete) {
    if (session.role !== "vet") {
      return { ok: false as const, reason: "forbidden" as const };
    }
    if (consultation.status === "ended") {
      return { ok: true as const, consultation };
    }

    consultation.status = "ended";
    consultation.endedAt = new Date();
    if (consultation.startedAt) {
      consultation.durationSeconds = Math.floor(
        (consultation.endedAt.getTime() - consultation.startedAt.getTime()) / 1000,
      );
    }
    await consultation.save();
    const completed = await Booking.findByIdAndUpdate(
      result.booking._id,
      { status: "completed" },
      { new: true },
    ).lean();
    if (completed) {
      try {
        await notifyBookingEvent("booking.completed", completed);
      } catch (err) {
        console.error("consultation completed notification error:", err);
      }
    }

    await Message.create({
      booking: result.booking._id,
      senderRole: "system",
      kind: "system",
      text: "Consultation ended.",
    });
  }

  return { ok: true as const, consultation };
}

export function consultTitle(booking: Record<string, unknown>, role: SessionUser["role"]) {
  const pet = (booking.patientName as string) || "Pet";
  const owner = (booking.ownerName as string) || "Owner";
  if (role === "vet") return `${pet} · ${owner}`;
  return `${pet} · Video consultation`;
}

export function consultDisplayName(session: SessionUser) {
  return session.email.split("@")[0] || (session.role === "vet" ? "Dr. Vet" : "Pet Owner");
}
