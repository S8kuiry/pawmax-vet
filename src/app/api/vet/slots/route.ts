import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Slot from "@/models/Slot";

// Ensure other models are registered in the Mongoose environment 
// so the deep populate hook doesn't crash
import "@/models/Booking";
import "@/models/User";

// ==========================================
// 1. GET ROUTE: Fetch Upcoming Roster
// ==========================================
export async function GET() {
  try {
    // 1. Authenticate the user session
    const session = await getSession();
    if (!session || session.role !== "vet") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    // 2. Establish database connection
    await dbConnect();

    // 3. Set up timing boundaries (Fetch from the beginning of today onwards)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 4. Retrieve this vet's slots and deeply resolve relational booking data
    const slots = await Slot.find({
      vetId: session.id,
      startTime: { $gte: startOfToday }
    })
      .sort({ startTime: 1 }) // Order chronologically
      .populate({
        path: "bookingId",
        select: "patientName ownerName ownerId status mode",
        populate: {
          path: "ownerId",
          select: "name email phone",
        },
      })
      .lean();

    // 5. Send back the clean dataset array
    return NextResponse.json(slots, { status: 200 });

  } catch (error: any) {
    console.error("CRITICAL SLOT_GET_ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error reading active slot rosters" }, 
      { status: 500 }
    );
  }
}

// ==========================================
// 2. POST ROUTE: Handle Multi-Slot Batch Generation
// ==========================================
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "vet") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    await dbConnect();
    const body = await req.json();
    const { date, slots } = body; // Expects target date string and the local staging array

    if (!date || !Array.isArray(slots) || slots.length === 0) {
      return NextResponse.json({ error: "Missing operational date or staging parameters" }, { status: 400 });
    }

    // Map and parse simple text times ("14:30") into proper database ISO Date instances
    const preparedDocuments = slots.map((slot: any) => {
      return {
        vetId: session.id,
        startTime: new Date(`${date}T${slot.startTime}:00`),
        endTime: new Date(`${date}T${slot.endTime}:00`),
        status: "available"
      };
    });

    // Execute an atomic multi-document insert to drop network overhead
    const insertedSlots = await Slot.insertMany(preparedDocuments);

    return NextResponse.json({ 
      success: true, 
      count: insertedSlots.length 
    }, { status: 201 });

  } catch (error: any) {
    console.error("CRITICAL SLOT_BATCH_POST_ERROR:", error);
    return NextResponse.json(
      { error: "Database rejected multi-slot insertion block" }, 
      { status: 500 }
    );
  }
}