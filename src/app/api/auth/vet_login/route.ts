import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { dbConnect } from "@/lib/db";
import { attachSessionCookie, signSession } from "@/lib/auth";
import Vet from "@/models/Vet";

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const { email, password, role } = await req.json();

    const user = await Vet.findOne({ email: email?.toLowerCase?.() ?? email });
    if (!user?.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (role && user.role !== role && user.role !== "admin") {
      return NextResponse.json(
        { error: `This account is registered as a ${user.role}. Switch tabs to sign in.` },
        { status: 403 }
      );
    }

    await Vet.updateOne({ _id: user._id }, { lastLoginAt: new Date() });

    const token = await signSession({
      id: String(user._id),
      role: user.role,
      email: user.email,
    });

    const res = NextResponse.json({
      user: { id: user._id, role: user.role, name: user.name },
    });
    return attachSessionCookie(res, token);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Login failed";
    console.error("POST /api/auth/login:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
