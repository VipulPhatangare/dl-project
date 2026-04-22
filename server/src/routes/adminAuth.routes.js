import { Router } from "express";
import { adminProfile, loginAdmin, logoutAdmin } from "../controllers/adminAuth.controller.js";
import { adminAuth } from "../middleware/auth.js";

const router = Router();

router.post("/login", loginAdmin);
router.post("/logout", adminAuth, logoutAdmin);
router.get("/profile", adminAuth, adminProfile);

export default router;