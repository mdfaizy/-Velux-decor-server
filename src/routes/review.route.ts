import { Router } from "express";
import {
  createReview,
  getAllReviews,
  getAReview,
  getAllReviewsAdmin,
  updateReviewStatus,
  deleteReview,
} from "../controllers/review.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/restrictTo";
import { UserRole } from "../model/user.model";

const router = Router();
const adminOnly = [authenticateToken, restrictTo(UserRole.ADMIN)];

// ✅ PUBLIC
// Customer submits a review (saved as pending until approved)
router.post("/", createReview);

// Approved reviews (sorted by newest first)
router.get("/", getAllReviews);

// ✅ ADMIN
router.get("/admin/all", ...adminOnly, getAllReviewsAdmin);
router.patch("/:id/status", ...adminOnly, updateReviewStatus);
router.delete("/:id", ...adminOnly, deleteReview);

// Get a single approved review by ID
router.get("/:id", getAReview);

export default router;
