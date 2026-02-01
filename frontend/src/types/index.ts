export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export enum UserRole {
  END_USER = 'end_user',
  FACULTY_ADMIN = 'faculty_admin',
  RELATED_UNIT = 'related_unit',
  FACULTY_LEADERSHIP = 'faculty_leadership',
}

export interface Category {
  id: number;
  categoryName: string;
  description: string;
  isActive: boolean;
}

export interface Feedback {
  id: string;
  userId: string | null;
  user: User | null;
  categoryId: number;
  category: Category;
  content: string;
  subject: string;
  submissionDate: string;
  status: FeedbackStatus;
  isAnonymous: boolean;
  assignedUnitId: string | null;
  updatedAt: string;
  attachments: Attachment[];
  responses: FeedbackResponse[];
}

export enum FeedbackStatus {
  SUBMITTED = 'submitted',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  REJECTED = 'rejected',
}

export interface Attachment {
  id: string;
  feedbackId: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
}

export interface FeedbackResponse {
  id: string;
  reportId: string;
  adminId: string;
  admin: { id: string; name: string };
  message: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  referenceId: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalFeedbacks: number;
  statusBreakdown: Record<string, number>;
  categoryBreakdown: { category: string; count: number }[];
  anonymousBreakdown: { anonymous: number; identified: number };
  monthlyTrends: { month: string; count: number }[];
  averageResolutionDays: string | null;
}
