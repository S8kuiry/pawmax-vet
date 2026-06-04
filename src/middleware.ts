import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE } from "@/lib/session-cookie";
import { verifySessionToken } from "@/lib/session-jwt";

const ADMIN_PREFIX = "/admin";
const VET_PREFIX = "/vet";
const OWNER_PREFIXES = ["/owner", "/pets", "/dashboard", "/bookings", "/vets", "/consult"];

export async function middleware(req: NextRequest) {
  const t = req.cookies.get(SESSION_COOKIE)?.value;
  const { pathname } = req.nextUrl;
  const needsAuth =
    pathname.startsWith(ADMIN_PREFIX) ||
    pathname.startsWith(VET_PREFIX) ||
    OWNER_PREFIXES.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();
  if (!t) return NextResponse.redirect(new URL("/login", req.url));
  if (!process.env.JWT_SECRET) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const u = await verifySessionToken(t);
  if (!u) return NextResponse.redirect(new URL("/login", req.url));

  if (pathname.startsWith(ADMIN_PREFIX) && u.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (pathname.startsWith(VET_PREFIX) && u.role !== "vet" && u.role !== "admin") {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (OWNER_PREFIXES.some((p) => pathname.startsWith(p)) && u.role === "vet") {
    return NextResponse.redirect(new URL("/vet/dashboard", req.url));
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!api|_next|favicon.ico|logo.svg).*)"] };
