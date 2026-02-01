import { Response } from "express";
import { AppDataSource } from "../data-source";
import { Notification } from "../entities/Notification";
import { AuthRequest } from "../middleware/auth";

const notificationRepository = () => AppDataSource.getRepository(Notification);

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereCondition: any = { userId: user.id };
    if (unreadOnly === "true") {
      whereCondition.isRead = false;
    }

    const [notifications, total] = await notificationRepository().findAndCount({
      where: whereCondition,
      order: { createdAt: "DESC" },
      skip,
      take: Number(limit),
    });

    const unreadCount = await notificationRepository().count({
      where: { userId: user.id, isRead: false },
    });

    return res.json({
      notifications,
      unreadCount,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get notifications error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { id } = req.params;

    const notification = await notificationRepository().findOne({
      where: { id, userId: user.id },
    });

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }

    notification.isRead = true;
    await notificationRepository().save(notification);

    return res.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error("Mark as read error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    await notificationRepository().update(
      { userId: user.id, isRead: false },
      { isRead: true }
    );

    return res.json({ message: "All notifications marked as read" });
  } catch (error) {
    console.error("Mark all as read error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const count = await notificationRepository().count({
      where: { userId: user.id, isRead: false },
    });

    return res.json({ unreadCount: count });
  } catch (error) {
    console.error("Get unread count error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
