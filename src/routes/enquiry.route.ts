import express from "express";
import { createEnquiry } from "../controllers/enquiry.controller";

const router = express.Router();

router.post("/create", createEnquiry);

export default router;