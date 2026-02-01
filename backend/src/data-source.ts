import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./entities/User";
import { Category } from "./entities/Category";
import { Feedback } from "./entities/Feedback";
import { Response } from "./entities/Response";
import { Notification } from "./entities/Notification";
import { Attachment } from "./entities/Attachment";
import { InitialSchema1704067200000 } from "./migrations/1704067200000-InitialSchema";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres123",
  database: process.env.DB_NAME || "faculty_feedback",
  synchronize: false,
  logging: process.env.NODE_ENV === "development",
  entities: [User, Category, Feedback, Response, Notification, Attachment],
  migrations: [InitialSchema1704067200000],
  subscribers: [],
});
