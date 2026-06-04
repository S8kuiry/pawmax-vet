import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

const prefsSchema = z.object({
  emailReminders: z.coerce.boolean().optional(),
  smsReminders: z.coerce.boolean().optional(),
  vaccineAlerts: z.coerce.boolean().optional(),
  marketing: z.coerce.boolean().optional(),
});

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
