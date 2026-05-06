import express from "express";
import {
  createShowroom,
  getShowrooms,
} from "../controllers/showroom.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/",authenticateToken, createShowroom);
router.get("/", getShowrooms);

export default router;