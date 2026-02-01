import { Router } from "express";
import {
  createFeedback,
  getFeedbacks,
  getFeedbackById,
  updateFeedbackStatus,
  addResponse,
  getMyFeedbacks,
} from "../controllers/feedbackController";
import { authenticate, authorize, optionalAuth } from "../middleware/auth";
import { upload } from "../middleware/upload";
import { UserRole } from "../entities/User";

const router = Router();

// Public routes (optional auth for anonymous submissions)
router.post("/", optionalAuth, upload.array("attachments", 5), createFeedback);

// Protected routes
router.get("/", authenticate, getFeedbacks);
router.get("/my", authenticate, getMyFeedbacks);
router.get("/:id", authenticate, getFeedbackById);

// Admin/Unit routes
router.patch(
  "/:id/status",
  authenticate,
  authorize(UserRole.FACULTY_ADMIN, UserRole.RELATED_UNIT, UserRole.FACULTY_LEADERSHIP),
  updateFeedbackStatus
);

router.post(
  "/:id/responses",
  authenticate,
  authorize(UserRole.FACULTY_ADMIN, UserRole.RELATED_UNIT, UserRole.FACULTY_LEADERSHIP),
  addResponse
);

export default router;
