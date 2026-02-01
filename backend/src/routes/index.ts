import { Router } from "express";
import authRoutes from "./authRoutes";
import feedbackRoutes from "./feedbackRoutes";
import categoryRoutes from "./categoryRoutes";
import notificationRoutes from "./notificationRoutes";
import dashboardRoutes from "./dashboardRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/reports", feedbackRoutes);
router.use("/categories", categoryRoutes);
router.use("/notifications", notificationRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
