import { Router } from "express";
import {
  createConsultation,
  getAllConsultations,
  getAConsultation,
  deleteConsultation,
  updateConsultationStatus,
} from "../controllers/consultation.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Create a new consultation request
router.post("/", createConsultation);

// Get all consultation requests (sorted by newest first)
router.get("/", getAllConsultations);
router.patch("/:id/status", authenticateToken,updateConsultationStatus);
// Get a single consultation by ID
router.get("/:id", getAConsultation);

// Delete a consultation request
router.delete("/:id", authenticateToken, deleteConsultation);

export default router;
