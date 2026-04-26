import { Router } from "express";
import {
  createReview,
  getAllReviews,
  getAReview,
  deleteReview,
} from "../controllers/review.controller";

const router = Router();

// Create a new review
router.post("/", createReview);

// Get all reviews (sorted by newest first)
router.get("/", getAllReviews);

// Get a single review by ID
router.get("/:id", getAReview);

// Delete a review
router.delete("/:id", deleteReview);

export default router;
