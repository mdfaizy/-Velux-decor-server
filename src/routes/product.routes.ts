import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  updateProduct,      
} from "../controllers/product.controller"; // Adjust path as needed

const router = Router();

/**
 * @route   GET /api/products
 * @desc    Get all products
 */
router.get("/", getAllProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get a single product by ID
 */
router.get("/:id", getProductById);

/**
 * @route   POST /api/products
 * @desc    Create a new product (handles multiple image uploads)
 */
router.post("/", createProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product and its images from Cloudinary
 */

router.put("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export default router;
