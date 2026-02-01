import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
} from "../controllers/categoryController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../entities/User";

const router = Router();

router.get("/", getCategories);
router.get("/:id", getCategoryById);

// Admin only routes
router.post(
  "/",
  authenticate,
  authorize(UserRole.FACULTY_ADMIN),
  createCategory
);

router.put(
  "/:id",
  authenticate,
  authorize(UserRole.FACULTY_ADMIN),
  updateCategory
);

export default router;
