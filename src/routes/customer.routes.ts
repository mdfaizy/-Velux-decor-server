import express from "express";
import {
  getCustomers,
  createCustomer,
  importCustomers,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { restrictTo } from "../middleware/restrictTo";
import { UserRole } from "../model/user.model";

const router = express.Router();

// ✅ ADMIN ONLY (customer phone numbers are personal data)
router.use(authenticateToken, restrictTo(UserRole.ADMIN));

router.get("/", getCustomers);
router.post("/", createCustomer);
router.post("/import", importCustomers);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
