import express from "express";
import {
  loginControllers,
  registerControllers,
  setAvatarController,
  forgotPasswordController,
  resetPasswordController,
} from "../controllers/userController.js";

const router = express.Router();

// Auth Routes
router.post("/register", registerControllers);
router.post("/login", loginControllers);
router.post("/setAvatar/:id", setAvatarController);

// Forgot Password Routes
router.post("/forgot-password", forgotPasswordController); // send reset link
router.post("/reset-password/:token", resetPasswordController); // reset password using token

export default router;
