import { Response } from "express";
import { AppDataSource } from "../data-source";
import { Feedback, FeedbackStatus } from "../entities/Feedback";
import { Response as FeedbackResponse } from "../entities/Response";
import { Attachment } from "../entities/Attachment";
import { Notification, NotificationType } from "../entities/Notification";
import { User, UserRole } from "../entities/User";
import { AuthRequest } from "../middleware/auth";

const feedbackRepository = () => AppDataSource.getRepository(Feedback);
const responseRepository = () => AppDataSource.getRepository(FeedbackResponse);
const attachmentRepository = () => AppDataSource.getRepository(Attachment);
const notificationRepository = () => AppDataSource.getRepository(Notification);
const userRepository = () => AppDataSource.getRepository(User);

export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, content, subject, isAnonymous } = req.body;
    const files = req.files as Express.Multer.File[];

    const feedback = feedbackRepository().create({
      categoryId,
      content,
      subject,
      isAnonymous: isAnonymous === true || isAnonymous === "true",
      userId: isAnonymous === true || isAnonymous === "true" ? null : req.userId || null,
      status: FeedbackStatus.SUBMITTED,
    });

    await feedbackRepository().save(feedback);

    // Save attachments if any
    if (files && files.length > 0) {
      for (const file of files) {
        const attachment = attachmentRepository().create({
          feedbackId: feedback.id,
          fileName: file.filename,
          originalName: file.originalname,
          filePath: file.path,
          fileSize: file.size,
          mimeType: file.mimetype,
        });
        await attachmentRepository().save(attachment);
      }
    }

    // Notify admins about new feedback
    const admins = await userRepository().find({
      where: [
        { role: UserRole.FACULTY_ADMIN },
        { role: UserRole.FACULTY_LEADERSHIP },
      ],
    });

    for (const admin of admins) {
      await notificationRepository().save(
        notificationRepository().create({
          userId: admin.id,
          title: "New Feedback Submitted",
          message: `A new feedback has been submitted${subject ? `: ${subject}` : ""}`,
          type: NotificationType.FEEDBACK_SUBMITTED,
          referenceId: feedback.id,
        })
      );
    }

    return res.status(201).json({
      message: "Feedback submitted successfully",
      feedback: {
        id: feedback.id,
        subject: feedback.subject,
        status: feedback.status,
        isAnonymous: feedback.isAnonymous,
        submissionDate: feedback.submissionDate,
      },
    });
  } catch (error) {
    console.error("Create feedback error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getFeedbacks = async (req: AuthRequest, res: Response) => {
  try {
    const { status, categoryId, page = 1, limit = 10 } = req.query;
    const user = req.user;

    const queryBuilder = feedbackRepository()
      .createQueryBuilder("feedback")
      .leftJoinAndSelect("feedback.category", "category")
      .leftJoinAndSelect("feedback.user", "user")
      .leftJoinAndSelect("feedback.attachments", "attachments")
      .orderBy("feedback.submissionDate", "DESC");

    // Filter by user role
    if (user?.role === UserRole.END_USER) {
      queryBuilder.where("feedback.user_id = :userId", { userId: user.id });
    } else if (user?.role === UserRole.RELATED_UNIT) {
      queryBuilder.where("feedback.assigned_unit_id = :unitId", { unitId: user.id });
    }

    if (status) {
      queryBuilder.andWhere("feedback.status = :status", { status });
    }

    if (categoryId) {
      queryBuilder.andWhere("feedback.category_id = :categoryId", { categoryId });
    }

    const skip = (Number(page) - 1) * Number(limit);
    queryBuilder.skip(skip).take(Number(limit));

    const [feedbacks, total] = await queryBuilder.getManyAndCount();

    // Hide user info for anonymous feedbacks
    const sanitizedFeedbacks = feedbacks.map((fb) => ({
      ...fb,
      user: fb.isAnonymous ? null : fb.user ? { id: fb.user.id, name: fb.user.name } : null,
      userId: fb.isAnonymous ? null : fb.userId,
    }));

    return res.json({
      feedbacks: sanitizedFeedbacks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get feedbacks error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getFeedbackById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const feedback = await feedbackRepository().findOne({
      where: { id },
      relations: ["category", "user", "attachments", "responses", "responses.admin"],
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    // Check access permission
    if (user?.role === UserRole.END_USER && feedback.userId !== user.id) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Hide user info for anonymous feedbacks (except for the submitter)
    const isOwner = user && feedback.userId === user.id;
    const sanitizedFeedback = {
      ...feedback,
      user: feedback.isAnonymous && !isOwner ? null : feedback.user,
      userId: feedback.isAnonymous && !isOwner ? null : feedback.userId,
      responses: feedback.responses.map((r) => ({
        ...r,
        admin: { id: r.admin.id, name: r.admin.name },
      })),
    };

    return res.json({ feedback: sanitizedFeedback });
  } catch (error) {
    console.error("Get feedback by id error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateFeedbackStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, assignedUnitId } = req.body;
    const user = req.user;

    const feedback = await feedbackRepository().findOne({
      where: { id },
      relations: ["user"],
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const oldStatus = feedback.status;
    feedback.status = status;

    if (assignedUnitId) {
      feedback.assignedUnitId = assignedUnitId;
    }

    await feedbackRepository().save(feedback);

    // Notify the user (if not anonymous) about status change
    if (feedback.userId && !feedback.isAnonymous) {
      await notificationRepository().save(
        notificationRepository().create({
          userId: feedback.userId,
          title: "Feedback Status Updated",
          message: `Your feedback status has been updated from ${oldStatus} to ${status}`,
          type: NotificationType.STATUS_CHANGED,
          referenceId: feedback.id,
        })
      );
    }

    // Notify assigned unit
    if (assignedUnitId) {
      await notificationRepository().save(
        notificationRepository().create({
          userId: assignedUnitId,
          title: "New Feedback Assigned",
          message: `A new feedback has been assigned to you`,
          type: NotificationType.ASSIGNED,
          referenceId: feedback.id,
        })
      );
    }

    return res.json({
      message: "Status updated successfully",
      feedback: {
        id: feedback.id,
        status: feedback.status,
        assignedUnitId: feedback.assignedUnitId,
      },
    });
  } catch (error) {
    console.error("Update feedback status error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const addResponse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const feedback = await feedbackRepository().findOne({
      where: { id },
      relations: ["user"],
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    const response = responseRepository().create({
      reportId: id,
      adminId: user.id,
      message,
    });

    await responseRepository().save(response);

    // Update feedback status to processing if still submitted
    if (feedback.status === FeedbackStatus.SUBMITTED) {
      feedback.status = FeedbackStatus.PROCESSING;
      await feedbackRepository().save(feedback);
    }

    // Notify user about the response
    if (feedback.userId && !feedback.isAnonymous) {
      await notificationRepository().save(
        notificationRepository().create({
          userId: feedback.userId,
          title: "New Response on Your Feedback",
          message: `An admin has responded to your feedback`,
          type: NotificationType.RESPONSE_ADDED,
          referenceId: feedback.id,
        })
      );
    }

    return res.status(201).json({
      message: "Response added successfully",
      response: {
        id: response.id,
        message: response.message,
        createdAt: response.createdAt,
        admin: { id: user.id, name: user.name },
      },
    });
  } catch (error) {
    console.error("Add response error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getMyFeedbacks = async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [feedbacks, total] = await feedbackRepository().findAndCount({
      where: { userId: user.id },
      relations: ["category", "attachments"],
      order: { submissionDate: "DESC" },
      skip,
      take: Number(limit),
    });

    return res.json({
      feedbacks,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error("Get my feedbacks error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
