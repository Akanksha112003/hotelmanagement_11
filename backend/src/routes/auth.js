import express from "express";

import { loginuser, registeruser, forgotPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registeruser);
router.post("/login", loginuser);
router.post("/forgot-password", forgotPassword);

export default router;
