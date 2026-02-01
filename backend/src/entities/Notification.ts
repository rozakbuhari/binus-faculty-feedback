import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";

export enum NotificationType {
  FEEDBACK_SUBMITTED = "feedback_submitted",
  STATUS_CHANGED = "status_changed",
  RESPONSE_ADDED = "response_added",
  ASSIGNED = "assigned",
}

@Entity("notifications")
export class Notification {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id", type: "uuid" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ length: 255 })
  title!: string;

  @Column({ type: "text" })
  message!: string;

  @Column({
    type: "enum",
    enum: NotificationType,
    default: NotificationType.FEEDBACK_SUBMITTED,
  })
  type!: NotificationType;

  @Column({ name: "reference_id", type: "uuid", nullable: true })
  referenceId!: string | null;

  @Column({ name: "is_read", default: false })
  isRead!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
