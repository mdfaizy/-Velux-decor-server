import express from "express";
import * as authController from "../controllers/auth.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/signin", authController.signin);
router.post("/forgotPassword", authController.forgotPassword);
router.patch("/resetPassword/:token", authController.resetPassword);

// For profile, you'll need a protect middleware (see next step)
router.get("/me", authenticateToken, authController.getMe);
// GET ALL USERS
router.get("/users", authController.getAllUsers);

// GET SINGLE USER
router.get("/users/:id", authenticateToken, authController.getUserById);

// UPDATE USER
router.put("/users/:id", authenticateToken, authController.updateUser);

// DELETE USER
router.delete("/users/:id", authenticateToken, authController.deleteUser);



export default router;
