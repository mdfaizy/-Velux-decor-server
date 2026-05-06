// import express from "express";
// import {
//   createCategory,
//   getAllCategories,
//   updateCategory,
//   deleteCategory,
//   toggleCategoryStatus,
// } from "../controllers/category.controller";

// const router = express.Router();

// router.post("/", createCategory);
// router.get("/", getAllCategories);
// router.put("/:id", updateCategory);
// router.delete("/:id", deleteCategory);
// router.patch("/toggle/:id", toggleCategoryStatus);

// export default router;


import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryWithSub, // 🔥 add this
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../controllers/category.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = express.Router();

// ✅ CREATE
router.post("/",authenticateToken, createCategory);

// ✅ GET ALL
router.get("/", getAllCategories);

// ✅ GET WITH SUBCATEGORY (IMPORTANT 🔥)
router.get("/with-sub", getCategoryWithSub);

// ✅ UPDATE
router.put("/:id",authenticateToken, updateCategory);

// ✅ DELETE
router.delete("/:id",authenticateToken, deleteCategory);

// ✅ TOGGLE ACTIVE
router.patch("/toggle/:id", authenticateToken,toggleCategoryStatus);

export default router;