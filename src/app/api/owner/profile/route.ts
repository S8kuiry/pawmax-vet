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

  try {
    // 1. Ensure database connection is active
    await dbConnect();

    const body = await req.json();

    const updateData: any = {
      name: body.name,
      phone: body.phone,
      emergencyContact: body.emergencyContact,
      address: body.address,
    };

    // Map the plain text address string into the schema's array structure
   

    // 2. Perform the update and capture the result
    const updatedUser = await User.findByIdAndUpdate(session.id, updateData, { new: true });

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 });
    }

    // 3. FIX: You must return a successful response back to your client component!
    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });

  } catch (error: any) {
    // 4. DIAGNOSTIC: This prints the real underlying error into your VS Code terminal!
    console.error("❌ BACKEND PATCH ERROR:", error);

    return NextResponse.json(
      { 
        error: "Bad Request", 
        details: error?.message || "Unknown server error" 
      }, 
      { status: 400 }
    );
  }
}