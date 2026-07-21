import express from "express";
import { createEnquiry , getAllEnquiries, deleteEnquiry,updateEnquiryStatus} from "../controllers/enquiry.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/create", createEnquiry);
router.get("/", authenticateToken, getAllEnquiries);         // ✅ ADD
router.put("/:id/status", authenticateToken,updateEnquiryStatus);
router.delete("/:id", authenticateToken, deleteEnquiry);

export default router;