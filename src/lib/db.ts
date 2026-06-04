import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI missing");
}

const connection = { isConnected: 0 };

export async function dbConnect() {
  // ✅ DNS config moved inside — await is valid here
  if (typeof window === "undefined") {
    const dns = await import("dns");
    dns.default.setDefaultResultOrder("ipv4first");
    dns.default.setServers(["8.8.8.8", "8.8.4.4"]);
  }

  if (connection.isConnected === 1) return;

  if (mongoose.connection.readyState === 1) {
    connection.isConnected = 1;
    return;
  }

  if (mongoose.connection.readyState === 2) {
    await new Promise((resolve, reject) => {
      mongoose.connection.once("connected", resolve);
      mongoose.connection.once("error", reject);
    });
    connection.isConnected = 1;
    return;
  }

  try {
    const db = await mongoose.connect(MONGODB_URI, { bufferCommands: false });
    connection.isConnected = db.connections[0].readyState;
    console.log("MongoDB connected successfully");
  } catch (err: any) {
    connection.isConnected = 0;
    console.error("MongoDB connection error:", err.message);
    throw err;
  }
}