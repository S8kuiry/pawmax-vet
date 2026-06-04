import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  phone: z.string().min(5).max(30).optional().or(z.literal("")),
  address: z.string().max(300).optional().or(z.literal("")),
  emergencyContact: z.string().max(120).optional().or(z.literal("")),
  notifications: z
    .object({
      email: z.boolean().optional(),
      sms: z.boolean().optional(),
      push: z.boolean().optional(),
      reminders: z.boolean().optional(),
    })
    .partial()
    .optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await dbConnect();

  const user = await User.findById(session.id).select("-password").lean();
  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  if (session.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  await dbConnect();
  await User.findByIdAndUpdate(session.id, {
    name: String(form.get("name") ?? "").trim() || undefined,
    phone: String(form.get("phone") ?? "").trim() || undefined,
  });

  return NextResponse.redirect(new URL("/owner/settings", req.url));
}

export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await dbConnect();

  const d = parsed.data;
  const update: Record<string, unknown> = {};
  if (d.name !== undefined) update.name = d.name;
  if (d.phone !== undefined) update.phone = d.phone;
  if (d.address !== undefined) update.address = d.address;
  if (d.emergencyContact !== undefined) update.emergencyContact = d.emergencyContact;
  if (d.notifications) update.notifications = d.notifications;

  const user = await User.findByIdAndUpdate(session.id, update, {
    new: true,
    runValidators: true,
  })
    .select("-password")
    .lean();

  if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ user });
}
