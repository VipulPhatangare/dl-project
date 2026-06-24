import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const adminAuth = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.admin = payload;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};