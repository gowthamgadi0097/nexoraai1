// Run: npm run test:db   (needs Node 20.6+ and a filled .env.local)
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) { console.error("FAIL: MONGODB_URI missing in .env.local"); process.exit(1); }

try {
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  console.log("OK: connected to database:", mongoose.connection.name);
  const users = await mongoose.connection.db.collection("users").countDocuments();
  console.log("OK: users collection reachable, documents:", users);
  await mongoose.disconnect();
} catch (e) {
  console.error("FAIL:", e.message);
  console.error("Check: password, cluster address, and Atlas Network Access (0.0.0.0/0).");
  process.exit(1);
}
