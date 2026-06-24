import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export const signAdminToken = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });