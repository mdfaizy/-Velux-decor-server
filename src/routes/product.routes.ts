// // import { Router } from "express";
// // import {
// //   createProduct,
// //   deleteProduct,
// //   getAllProducts,
// //   getProductById,
// //   updateProduct,   
// //   getProductBySlug,   
// // } from "../controllers/product.controller"; // Adjust path as needed

// // const router = Router();

// // /**
// //  * @route   GET /api/products
// //  * @desc    Get all products
// //  */
// // router.get("/", getAllProducts);

// // /**
// //  * @route   GET /api/products/:id
// //  * @desc    Get a single product by ID
// //  */
// // router.get("/:id", getProductById);

// // /**
// //  * @route   POST /api/products
// //  * @desc    Create a new product (handles multiple image uploads)
// //  */
// // router.post("/", createProduct);

// // /**
// //  * @route   DELETE /api/products/:id
// //  * @desc    Delete product and its images from Cloudinary
// //  */

// // router.put("/:id", updateProduct);
// // router.delete("/:id", deleteProduct);
// // router.get("/:categorySlug/:subCategorySlug/:productSlug", getProductBySlug);
// // export default router;



// import { Router } from "express";
// import {
//   createProduct,
//   deleteProduct,
//   getAllProducts,
//   getProductById,
//   updateProduct,
//   getProductBySlug,
//   getProductsBySlug, // 🔥 ADD THIS
// } from "../controllers/product.controller";

// const router = Router();

// // ✅ GET ALL
// router.get("/", getAllProducts);

// // ✅ PRODUCT DETAIL (slug) - MOST SPECIFIC FIRST
// router.get("/:categorySlug/:subCategorySlug/:productSlug", getProductBySlug);

// // ✅ CATEGORY + SUBCATEGORY
// router.get("/:categorySlug/:subCategorySlug", getProductsBySlug);

// // ✅ CATEGORY ONLY
// router.get("/category/:categorySlug", getProductsBySlug);

// // ✅ GET BY ID (SAFE)
// router.get("/id/:id", getProductById);

// // CREATE / UPDATE / DELETE
// router.post("/", createProduct);
// router.put("/:id", updateProduct);
// router.delete("/:id", deleteProduct);

// export default router;


import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  getProductBySlug,
  getProductsBySlug,
} from "../controllers/product.controller";

const router = Router();

// ✅ GET ALL PRODUCTS
router.get("/", getAllProducts);

// 🔥 PRODUCT DETAIL (WITH SUBCATEGORY)
router.get("/:categorySlug/:subCategorySlug/:productSlug", getProductBySlug);

// 🔥 PRODUCT DETAIL (NO SUBCATEGORY)
router.get("/:categorySlug/:productSlug", getProductBySlug);

// 🔥 CATEGORY + SUBCATEGORY PRODUCTS
router.get("/:categorySlug/:subCategorySlug", getProductsBySlug);

// 🔥 CATEGORY ONLY PRODUCTS (IMPORTANT)
router.get("/:categorySlug", getProductsBySlug);

// ✅ GET PRODUCT BY ID (SAFE ROUTE)
router.get("/id/:id", getProductById);

// ✅ CREATE PRODUCT
router.post("/", createProduct);

// ✅ UPDATE PRODUCT
router.put("/:id", updateProduct);

// ✅ DELETE PRODUCT
router.delete("/:id", deleteProduct);

export default router;