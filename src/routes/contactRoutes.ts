// import express from "express";
// import { createContact ,updateContact,
//   deleteContact,
//   getSingleContact,getAllContacts} from "../controllers/contactController.js";

// const router = express.Router();

// router.post("/contact", createContact);
// router.get("/:id", getSingleContact);
// router.put("/:id", updateContact);
// router.delete("/:id", deleteContact);

// export default router;


import express from "express";
import {
  createContact,
  updateContact,
  deleteContact,
  getSingleContact,
  getAllContacts,
} from "../controllers/contactController.js";

const router = express.Router();

// ✅ Create
router.post("/contact", createContact);

// ✅ Get All
router.get("/", getAllContacts);

// ✅ Get Single
router.get("/:id", getSingleContact);

// ✅ Update
router.put("/:id", updateContact);

// ✅ Delete
router.delete("/:id", deleteContact);

export default router;

