import express from "express";
import {
  createSubCategory,
  getSubByCategory,
  getAllSubCategories,
  updateSubCategory,
  deleteSubCategory,
  toggleSubCategory,
  getSubByCategorySlug,
} from "../controllers/subcategory.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

// ✅ CREATE SUB CATEGORY
router.post("/",authenticateToken, createSubCategory);

router.get("/", getAllSubCategories); // ✅ ADD THIS
// ✅ GET SUBCATEGORY BY CATEGORY ID
router.get("/category/:categoryId", getSubByCategory);

// ✅ UPDATE SUB CATEGORY
router.put("/:id", updateSubCategory);

// ✅ DELETE SUB CATEGORY
router.delete("/:id", deleteSubCategory);

// ✅ TOGGLE ACTIVE/INACTIVE
router.patch("/toggle/:id", toggleSubCategory);
router.get("/slug/:categorySlug", getSubByCategorySlug);

export default router;