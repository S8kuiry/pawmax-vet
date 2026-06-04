import { NextResponse } from "next/server";
import { z } from "zod";
import { isValidObjectId } from "mongoose";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { endConsultation } from "@/lib/consult-session";

const bodySchema = z.object({
  complete: z.boolean().optional(),
});

export async function POST(
  req: Request,
  ctx: { params: Promise<{ bookingId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "vet" && session.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { bookingId } = await ctx.params;
  if (!isValidObjectId(bookingId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  let body: unknown = {};
  try {
    const raw = await req.text();
    if (raw) body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await dbConnect();
  const result = await endConsultation(bookingId, session, {
    complete: parsed.data.complete ?? false,
  });

  if (!result.ok) {
    if (result.reason === "forbidden") {
      return NextResponse.json({ error: "Only the vet can complete a consultation" }, { status: 403 });
    }
    if (result.reason === "blocked") {
      return NextResponse.json({ error: "Consultation unavailable" }, { status: 409 });
    }
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    consultation: result.consultation,
    completed: !!parsed.data.complete,
  });
}
