import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Feedback } from "./Feedback";

@Entity("attachments")
export class Attachment {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "feedback_id", type: "uuid" })
  feedbackId!: string;

  @ManyToOne(() => Feedback, (feedback) => feedback.attachments)
  @JoinColumn({ name: "feedback_id" })
  feedback!: Feedback;

  @Column({ name: "file_name", length: 255 })
  fileName!: string;

  @Column({ name: "original_name", length: 255 })
  originalName!: string;

  @Column({ name: "file_path", length: 500 })
  filePath!: string;

  @Column({ name: "file_size" })
  fileSize!: number;

  @Column({ name: "mime_type", length: 100 })
  mimeType!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
