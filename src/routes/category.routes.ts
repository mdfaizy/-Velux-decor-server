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

const router = express.Router();

// ✅ CREATE
router.post("/", createCategory);

// ✅ GET ALL
router.get("/", getAllCategories);

// ✅ GET WITH SUBCATEGORY (IMPORTANT 🔥)
router.get("/with-sub", getCategoryWithSub);

// ✅ UPDATE
router.put("/:id", updateCategory);

// ✅ DELETE
router.delete("/:id", deleteCategory);

// ✅ TOGGLE ACTIVE
router.patch("/toggle/:id", toggleCategoryStatus);

export default router;