import express from "express";
import { createEnquiry , getAllEnquiries, deleteEnquiry} from "../controllers/enquiry.controller";

const router = express.Router();

router.post("/create", createEnquiry);
router.get("/", getAllEnquiries);         // ✅ ADD
router.delete("/:id", deleteEnquiry);

export default router;