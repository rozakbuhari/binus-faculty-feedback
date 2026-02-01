import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Feedback } from "./Feedback";
import { Response } from "./Response";
import { Notification } from "./Notification";

export enum UserRole {
  END_USER = "end_user",
  FACULTY_ADMIN = "faculty_admin",
  RELATED_UNIT = "related_unit",
  FACULTY_LEADERSHIP = "faculty_leadership",
}

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column()
  password!: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.END_USER,
  })
  role!: UserRole;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => Feedback, (feedback) => feedback.user)
  feedbacks!: Feedback[];

  @OneToMany(() => Response, (response) => response.admin)
  responses!: Response[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];
}
