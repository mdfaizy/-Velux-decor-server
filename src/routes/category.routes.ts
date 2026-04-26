import express from "express";
import {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../controllers/category.controller";

const router = express.Router();

router.post("/", createCategory);
router.get("/", getAllCategories);
router.put("/:id", updateCategory);
router.delete("/:id", deleteCategory);
router.patch("/toggle/:id", toggleCategoryStatus);

export default router;