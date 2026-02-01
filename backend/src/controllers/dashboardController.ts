import { Response } from "express";
import { AppDataSource } from "../data-source";
import { Feedback, FeedbackStatus } from "../entities/Feedback";
import { Category } from "../entities/Category";
import { AuthRequest } from "../middleware/auth";

const feedbackRepository = () => AppDataSource.getRepository(Feedback);
const categoryRepository = () => AppDataSource.getRepository(Category);

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    const queryBuilder = feedbackRepository().createQueryBuilder("feedback");

    if (startDate) {
      queryBuilder.andWhere("feedback.submission_date >= :startDate", {
        startDate: new Date(startDate as string),
      });
    }

    if (endDate) {
      queryBuilder.andWhere("feedback.submission_date <= :endDate", {
        endDate: new Date(endDate as string),
      });
    }

    // Total feedbacks
    const totalFeedbacks = await queryBuilder.getCount();

    // By status
    const statusStats = await feedbackRepository()
      .createQueryBuilder("feedback")
      .select("feedback.status", "status")
      .addSelect("COUNT(*)", "count")
      .groupBy("feedback.status")
      .getRawMany();

    // By category
    const categoryStats = await feedbackRepository()
      .createQueryBuilder("feedback")
      .leftJoin("feedback.category", "category")
      .select("category.category_name", "categoryName")
      .addSelect("COUNT(*)", "count")
      .groupBy("category.id")
      .addGroupBy("category.category_name")
      .getRawMany();

    // Anonymous vs Non-anonymous
    const anonymousStats = await feedbackRepository()
      .createQueryBuilder("feedback")
      .select("feedback.is_anonymous", "isAnonymous")
      .addSelect("COUNT(*)", "count")
      .groupBy("feedback.is_anonymous")
      .getRawMany();

    // Monthly trends (last 6 months)
    const monthlyTrends = await feedbackRepository()
      .createQueryBuilder("feedback")
      .select("TO_CHAR(feedback.submission_date, 'YYYY-MM')", "month")
      .addSelect("COUNT(*)", "count")
      .where("feedback.submission_date >= NOW() - INTERVAL '6 months'")
      .groupBy("TO_CHAR(feedback.submission_date, 'YYYY-MM')")
      .orderBy("month", "ASC")
      .getRawMany();

    // Average resolution time (for completed feedbacks)
    const avgResolutionTime = await feedbackRepository()
      .createQueryBuilder("feedback")
      .select(
        "AVG(EXTRACT(EPOCH FROM (feedback.updated_at - feedback.submission_date)) / 86400)",
        "avgDays"
      )
      .where("feedback.status = :status", { status: FeedbackStatus.COMPLETED })
      .getRawOne();

    return res.json({
      stats: {
        totalFeedbacks,
        statusBreakdown: statusStats.reduce((acc: any, item: any) => {
          acc[item.status] = parseInt(item.count);
          return acc;
        }, {}),
        categoryBreakdown: categoryStats.map((item: any) => ({
          category: item.categoryName,
          count: parseInt(item.count),
        })),
        anonymousBreakdown: {
          anonymous: parseInt(
            anonymousStats.find((s: any) => s.isAnonymous === true)?.count || "0"
          ),
          identified: parseInt(
            anonymousStats.find((s: any) => s.isAnonymous === false)?.count || "0"
          ),
        },
        monthlyTrends: monthlyTrends.map((item: any) => ({
          month: item.month,
          count: parseInt(item.count),
        })),
        averageResolutionDays: avgResolutionTime?.avgDays
          ? parseFloat(avgResolutionTime.avgDays).toFixed(1)
          : null,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getUnitPerformance = async (req: AuthRequest, res: Response) => {
  try {
    const unitPerformance = await feedbackRepository()
      .createQueryBuilder("feedback")
      .leftJoin("feedback.assignedUnit", "unit")
      .select("unit.id", "unitId")
      .addSelect("unit.name", "unitName")
      .addSelect("COUNT(*)", "totalAssigned")
      .addSelect(
        `SUM(CASE WHEN feedback.status = '${FeedbackStatus.COMPLETED}' THEN 1 ELSE 0 END)`,
        "completed"
      )
      .addSelect(
        `SUM(CASE WHEN feedback.status = '${FeedbackStatus.PROCESSING}' THEN 1 ELSE 0 END)`,
        "processing"
      )
      .where("feedback.assigned_unit_id IS NOT NULL")
      .groupBy("unit.id")
      .addGroupBy("unit.name")
      .getRawMany();

    return res.json({
      unitPerformance: unitPerformance.map((item: any) => ({
        unitId: item.unitId,
        unitName: item.unitName,
        totalAssigned: parseInt(item.totalAssigned),
        completed: parseInt(item.completed),
        processing: parseInt(item.processing),
        completionRate:
          item.totalAssigned > 0
            ? ((parseInt(item.completed) / parseInt(item.totalAssigned)) * 100).toFixed(1)
            : 0,
      })),
    });
  } catch (error) {
    console.error("Get unit performance error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
