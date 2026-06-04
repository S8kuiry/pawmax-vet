import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import {
  signSession as signSessionJwt,
  verifySessionToken,
  type SessionUser,
} from "@/lib/session-jwt";

export { SESSION_COOKIE };
export type { SessionUser };

export async function signSession(u: SessionUser): Promise<string> {
  return signSessionJwt(u);
}

export function attachSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const t = cookieStore.get(SESSION_COOKIE)?.value;
  if (!t) return null;
  return verifySessionToken(t);
}

export async function requireRole(
  role: SessionUser["role"] | SessionUser["role"][]
) {
  const s = await getSession();
  if (!s) throw new Response("Unauthorized", { status: 401 });
  const roles = Array.isArray(role) ? role : [role];
  if (!roles.includes(s.role)) {
    throw new Response("Forbidden", { status: 403 });
  }
  return s;
}
