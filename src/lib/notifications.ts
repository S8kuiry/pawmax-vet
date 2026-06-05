import Notification from "@/models/Notification";

type BookingLike = {
  _id: unknown;
  vetId: unknown;
  ownerId: unknown;
  patientName?: string;
  ownerName?: string;
  startAt: Date | string;
  status?: string;
};

type BookingEvent =
  | "booking.requested"
  | "booking.pending"
  | "booking.confirmed"
  | "booking.declined"
  | "booking.cancelled";

const EVENT_COPY: Record<
  BookingEvent,
  { vet?: { title: string; body: (b: BookingLike) => string }; owner?: { title: string; body: (b: BookingLike) => string } }
> = {
  "booking.requested": {
    vet: {
      title: "New booking request",
      body: (b) =>
        `${b.ownerName || "A pet owner"} requested a consultation for ${b.patientName || "their pet"} on ${formatWhen(b.startAt)}.`,
    },
    owner: {
      title: "Booking request sent",
      body: (b) =>
        `Your consultation request for ${b.patientName || "your pet"} on ${formatWhen(b.startAt)} is pending vet confirmation.`,
    },
  },
  "booking.pending": {
    owner: {
      title: "Booking pending",
      body: (b) =>
        `Your consultation for ${b.patientName || "your pet"} on ${formatWhen(b.startAt)} is awaiting confirmation.`,
    },
  },
  "booking.confirmed": {
    owner: {
      title: "Booking confirmed",
      body: (b) =>
        `Your consultation for ${b.patientName || "your pet"} on ${formatWhen(b.startAt)} has been confirmed.`,
    },
    vet: {
      title: "Booking confirmed",
      body: (b) =>
        `You confirmed the consultation for ${b.patientName || "a pet"} (${b.ownerName || "owner"}) on ${formatWhen(b.startAt)}.`,
    },
  },
  "booking.declined": {
    owner: {
      title: "Booking declined",
      body: (b) =>
        `Your consultation request for ${b.patientName || "your pet"} on ${formatWhen(b.startAt)} was declined.`,
    },
    vet: {
      title: "Booking declined",
      body: (b) =>
        `You declined the consultation for ${b.patientName || "a pet"} on ${formatWhen(b.startAt)}.`,
    },
  },
  "booking.cancelled": {
    owner: {
      title: "Booking cancelled",
      body: (b) =>
        `The consultation for ${b.patientName || "your pet"} on ${formatWhen(b.startAt)} was cancelled.`,
    },
    vet: {
      title: "Booking cancelled",
      body: (b) =>
        `The consultation for ${b.patientName || "a pet"} (${b.ownerName || "owner"}) on ${formatWhen(b.startAt)} was cancelled.`,
    },
  },
};

function formatWhen(startAt: Date | string) {
  return new Date(startAt).toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

async function createInAppNotification(opts: {
  userId: string;
  audience: "customer" | "vet" | "admin";
  type: BookingEvent;
  title: string;
  body: string;
  bookingId: string;
}) {
  return Notification.create({
    userId: opts.userId,
    audience: opts.audience,
    channel: "inapp",
    type: opts.type,
    title: opts.title,
    body: opts.body,
    data: { bookingId: opts.bookingId, deepLink: `/bookings/${opts.bookingId}` },
    provider: "inapp",
    status: "delivered",
    deliveredAt: new Date(),
  });
}

export async function notifyBookingEvent(event: BookingEvent, booking: BookingLike) {
  const copy = EVENT_COPY[event];
  const bookingId = String(booking._id);
  const tasks: Promise<unknown>[] = [];

  if (copy.vet) {
    tasks.push(
      createInAppNotification({
        userId: String(booking.vetId),
        audience: "vet",
        type: event,
        title: copy.vet.title,
        body: copy.vet.body(booking),
        bookingId,
      }),
    );
  }

  if (copy.owner) {
    tasks.push(
      createInAppNotification({
        userId: String(booking.ownerId),
        audience: "customer",
        type: event,
        title: copy.owner.title,
        body: copy.owner.body(booking),
        bookingId,
      }),
    );
  }

  await Promise.all(tasks);
}
