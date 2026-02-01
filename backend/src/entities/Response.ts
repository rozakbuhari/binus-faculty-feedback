import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Feedback } from "./Feedback";

@Entity("responses")
export class Response {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "report_id", type: "uuid" })
  reportId!: string;

  @ManyToOne(() => Feedback, (feedback) => feedback.responses)
  @JoinColumn({ name: "report_id" })
  feedback!: Feedback;

  @Column({ name: "admin_id", type: "uuid" })
  adminId!: string;

  @ManyToOne(() => User, (user) => user.responses)
  @JoinColumn({ name: "admin_id" })
  admin!: User;

  @Column({ type: "text" })
  message!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
