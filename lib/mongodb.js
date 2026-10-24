import mongoose from "mongoose";

// Reuse one connection across hot reloads (dev) and warm serverless calls (Vercel).
let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 8000, // fail fast with a clear error instead of hanging
        maxPoolSize: 5,
      })
      .then((m) => m)
      .catch((err) => {
        cached.promise = null; // IMPORTANT: do not cache a failed attempt, allow retry
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

// Turns a raw MongoDB / env error into a short, safe message for the UI.
export function dbErrorMessage(e) {
  const m = String((e && e.message) || e);
  if (m.includes("MONGODB_URI is not set")) return "Server is missing MONGODB_URI. Add it in your host's environment variables.";
  if (m.includes("JWT_SECRET is not set")) return "Server is missing JWT_SECRET. Add it in your host's environment variables.";
  if (/bad auth|Authentication failed/i.test(m)) return "MongoDB username or password is wrong in MONGODB_URI.";
  if (/ENOTFOUND|querySrv|ECONNREFUSED/i.test(m)) return "Cannot reach MongoDB. Check the cluster address in MONGODB_URI.";
  if (/Server selection timed out|ReplicaSetNoPrimary|whitelist|IP/i.test(m)) return "MongoDB blocked the connection. In Atlas > Network Access, allow 0.0.0.0/0.";
  return "Server error. Please try again.";
}
