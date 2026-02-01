import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Category } from "./Category";
import { Response } from "./Response";
import { Attachment } from "./Attachment";

export enum FeedbackStatus {
  SUBMITTED = "submitted",
  PROCESSING = "processing",
  COMPLETED = "completed",
  REJECTED = "rejected",
}

@Entity("feedbacks")
export class Feedback {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid", nullable: true })
  userId!: string | null;

  @ManyToOne(() => User, (user) => user.feedbacks, { nullable: true })
  @JoinColumn({ name: "user_id" })
  user!: User | null;

  @Column({ name: "category_id" })
  categoryId!: number;

  @ManyToOne(() => Category, (category) => category.feedbacks)
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @Column({ type: "text" })
  content!: string;

  @Column({ length: 255, nullable: true })
  subject!: string;

  @CreateDateColumn({ name: "submission_date" })
  submissionDate!: Date;

  @Column({
    type: "enum",
    enum: FeedbackStatus,
    default: FeedbackStatus.SUBMITTED,
  })
  status!: FeedbackStatus;

  @Column({ name: "is_anonymous", default: false })
  isAnonymous!: boolean;

  @Column({ name: "assigned_unit_id", type: "uuid", nullable: true })
  assignedUnitId!: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "assigned_unit_id" })
  assignedUnit!: User | null;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => Response, (response) => response.feedback)
  responses!: Response[];

  @OneToMany(() => Attachment, (attachment) => attachment.feedback)
  attachments!: Attachment[];
}
