import express from "express";
import {
  getActiveOffers,
  getOffers,
  createOffer,
  updateOffer,
  toggleOfferStatus,
  deleteOffer,
} from "../controllers/offer.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/restrictTo";
import { UserRole } from "../model/user.model";

const router = express.Router();

// ✅ PUBLIC (used by the moving banner on the website)
router.get("/active", getActiveOffers);

// ✅ ADMIN
const adminOnly = [authenticateToken, restrictTo(UserRole.ADMIN)];

router.get("/", ...adminOnly, getOffers);
router.post("/", ...adminOnly, createOffer);
router.put("/:id", ...adminOnly, updateOffer);
router.patch("/toggle/:id", ...adminOnly, toggleOfferStatus);
router.delete("/:id", ...adminOnly, deleteOffer);

export default router;
