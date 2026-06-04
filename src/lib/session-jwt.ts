import { SignJWT, jwtVerify } from "jose";

export type SessionUser = {
  id: string;
  role: "owner" | "vet" | "admin";
  email: string;
};

function secretKey() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET is not set. Add it to .env.local");
  return new TextEncoder().encode(secret);
}

export async function signSession(u: SessionUser): Promise<string> {
  return new SignJWT({ id: u.id, role: u.role, email: u.email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRY || "7d")
    .sign(secretKey());
}

/** Works in Edge middleware and Node API routes. */
export async function verifySessionToken(
  token: string
): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const { id, role, email } = payload;
    if (
      typeof id !== "string" ||
      typeof email !== "string" ||
      typeof role !== "string" ||
      !["owner", "vet", "admin"].includes(role)
    ) {
      return null;
    }
    return { id, role: role as SessionUser["role"], email };
  } catch {
    return null;
  }
}
