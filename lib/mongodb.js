import mongoose from "mongoose";

// Cache connection cho serverless (tranh mo moi connection moi lan goi API)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Thieu MONGODB_URI trong bien moi truong (xem .env.example)");
}

let cached = global._mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
      maxPoolSize: 10
    }).then((m) => m);
  }
  cached.conn = await cached.promise;
  global._mongoose = cached;
  return cached.conn;
}
