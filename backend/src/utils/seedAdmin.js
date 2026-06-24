import bcrypt from "bcryptjs";
import { connectDb } from "../config/db.js";
import { env } from "../config/env.js";
import { Admin } from "../models/Admin.js";

const seed = async () => {
  await connectDb();

  const existing = await Admin.findOne({ email: env.defaultAdminEmail.toLowerCase() });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }

  const passwordHash = await bcrypt.hash(env.defaultAdminPassword, 12);

  await Admin.create({
    email: env.defaultAdminEmail.toLowerCase(),
    passwordHash,
    role: "admin"
  });

  console.log(`Admin created: ${env.defaultAdminEmail}`);
  process.exit(0);
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});