import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { attachSessionCookie, signSession } from "@/lib/auth";
import Vet from "@/models/Vet";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { name, email, phone, password, role } = await req.json();

    if (!["owner", "vet"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase();
    if (await Vet.findOne({ email: normalizedEmail })) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await Vet.create({
      name,
      email: normalizedEmail,
      phone,
      passwordHash,
      role,
      kycStatus: role === "vet" ? "pending" : "n/a",
    });

    const token = await signSession({
      id: String(user._id),
      role: user.role,
      email: user.email,
    });

    const res = NextResponse.json({ user: { id: user._id, role: user.role, name } });
    return attachSessionCookie(res, token);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Registration failed";
    console.error("POST /api/auth/register:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
