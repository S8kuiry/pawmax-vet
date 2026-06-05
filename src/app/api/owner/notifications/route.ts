import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Notification from "@/models/Notification";

const prefsSchema = z.object({
  emailReminders: z.coerce.boolean().optional(),
  smsReminders: z.coerce.boolean().optional(),
  vaccineAlerts: z.coerce.boolean().optional(),
  marketing: z.coerce.boolean().optional(),
});

const patchSchema = z.object({
  ids: z.array(z.string().min(1)).max(500).optional(),
  all: z.boolean().optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();
  const items = await Notification.find({ userId: session.id })
    .sort({ createdAt: -1 })
    .limit(100)
    .lean();
  const unread = await Notification.countDocuments({
    userId: session.id,
    readAt: null,
  });

  return NextResponse.json({ items, unread });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed", issues: parsed.error.flatten() }, { status: 400 });
  }

  await dbConnect();
  const filter: Record<string, unknown> = { userId: session.id };
  if (!parsed.data.all) {
    if (!parsed.data.ids?.length) {
      return NextResponse.json({ error: "ids or all required" }, { status: 400 });
    }
    filter._id = { $in: parsed.data.ids };
  }

  const res = await Notification.updateMany(filter, { $set: { readAt: new Date(), status: "read" } });
  return NextResponse.json({ updated: res.modifiedCount });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  if (session.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const parsed = prefsSchema.safeParse({
    emailReminders: form.get("emailReminders") === "on",
    smsReminders: form.get("smsReminders") === "on",
    vaccineAlerts: form.get("vaccineAlerts") === "on",
    marketing: form.get("marketing") === "on",
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/owner/settings", req.url));
  }

  await dbConnect();
  await User.findByIdAndUpdate(session.id, {
    acceptsEmail: parsed.data.emailReminders ?? true,
    acceptsWhatsApp: parsed.data.smsReminders ?? true,
  });

  return NextResponse.redirect(new URL("/owner/settings", req.url));
}
