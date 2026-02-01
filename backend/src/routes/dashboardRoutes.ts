import { Router } from "express";
import { getStats, getUnitPerformance } from "../controllers/dashboardController";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../entities/User";

const router = Router();

router.get(
  "/stats",
  authenticate,
  authorize(UserRole.FACULTY_ADMIN, UserRole.FACULTY_LEADERSHIP),
  getStats
);

router.get(
  "/unit-performance",
  authenticate,
  authorize(UserRole.FACULTY_ADMIN, UserRole.FACULTY_LEADERSHIP),
  getUnitPerformance
);

export default router;
