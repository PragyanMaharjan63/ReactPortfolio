import mongoose from "mongoose";
import { env } from "../env.js";

let connected = false;

/**
 * Connects to MongoDB when MONGODB_URI is set.
 *
 * The site is content-complete without a database — the client ships the same
 * project data as a typed module. Mongo is an optional upgrade that makes the
 * content editable at runtime, so a connection failure must never take the
 * site down; it degrades to the bundled content instead.
 */
export async function connectDb(): Promise<boolean> {
  if (!env.mongoUri) {
    console.warn("[db] MONGODB_URI not set — serving bundled project content.");
    return false;
  }
  if (connected) return true;

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    connected = true;
    console.log("[db] connected");
    return true;
  } catch (error) {
    console.error(
      "[db] connection failed, falling back to bundled content:",
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}

export const isDbConnected = (): boolean =>
  connected && mongoose.connection.readyState === 1;
