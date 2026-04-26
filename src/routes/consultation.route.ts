import { Router } from "express";
import {
  createConsultation,
  getAllConsultations,
  getAConsultation,
  deleteConsultation,
} from "../controllers/consultation.controller";

const router = Router();

// Create a new consultation request
router.post("/", createConsultation);

// Get all consultation requests (sorted by newest first)
router.get("/", getAllConsultations);

// Get a single consultation by ID
router.get("/:id", getAConsultation);

// Delete a consultation request
router.delete("/:id", deleteConsultation);

export default router;
