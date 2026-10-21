import express from "express";
import {
  getWhatsAppStatus,
  getTemplates,
  sendTestMessage,
  getMessageStatus,
  createBroadcast,
  getBroadcasts,
} from "../controllers/broadcast.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/restrictTo";
import { UserRole } from "../model/user.model";

const router = express.Router();

// ✅ ADMIN ONLY
router.use(authenticateToken, restrictTo(UserRole.ADMIN));

router.get("/status", getWhatsAppStatus);
router.get("/templates", getTemplates);
router.post("/test", sendTestMessage);
router.get("/message/:wamid", getMessageStatus);
router.get("/", getBroadcasts);
router.post("/", createBroadcast);

export default router;
