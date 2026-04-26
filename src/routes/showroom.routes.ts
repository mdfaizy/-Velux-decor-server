import express from "express";
import {
  createShowroom,
  getShowrooms,
} from "../controllers/showroom.controller";

const router = express.Router();

router.post("/", createShowroom);
router.get("/", getShowrooms);

export default router;