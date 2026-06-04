import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.redirect(new URL("/login", req.url));
  if (session.role !== "owner") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const form = await req.formData();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  const settingsUrl = new URL("/owner/settings", req.url);
  if (!current || !next || next !== confirm) {
    settingsUrl.searchParams.set("error", "password_mismatch");
    return NextResponse.redirect(settingsUrl);
  }

  await dbConnect();
  const user = await User.findById(session.id);
  if (!user?.passwordHash) {
    settingsUrl.searchParams.set("error", "no_password");
    return NextResponse.redirect(settingsUrl);
  }

  const ok = await bcrypt.compare(current, user.passwordHash);
  if (!ok) {
    settingsUrl.searchParams.set("error", "wrong_password");
    return NextResponse.redirect(settingsUrl);
  }

  user.passwordHash = await bcrypt.hash(next, 10);
  await user.save();

  settingsUrl.searchParams.set("saved", "1");
  return NextResponse.redirect(settingsUrl);
}
