import bcrypt from "bcryptjs";
import { Admin } from "../models/Admin.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signAdminToken } from "../utils/token.js";

export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = signAdminToken({ id: admin._id.toString(), email: admin.email, role: admin.role });

  return res.json({
    token,
    admin: { id: admin._id, email: admin.email, role: admin.role }
  });
});

export const logoutAdmin = asyncHandler(async (_req, res) => {
  return res.json({ message: "Logged out successfully" });
});

export const adminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select("-passwordHash");
  if (!admin) {
    return res.status(404).json({ message: "Admin not found" });
  }

  return res.json({ admin });
});