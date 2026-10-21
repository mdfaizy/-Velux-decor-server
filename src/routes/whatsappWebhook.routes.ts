import express from "express";
import {
  verifyWebhook,
  receiveWebhook,
} from "../controllers/whatsappWebhook.controller";

const router = express.Router();

// ✅ PUBLIC — called by Meta (secured by verify token + signature check)
router.get("/", verifyWebhook);
router.post("/", receiveWebhook);

export default router;
