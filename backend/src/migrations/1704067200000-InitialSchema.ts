import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1704067200000 implements MigrationInterface {
  name = "InitialSchema1704067200000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enum types
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM ('end_user', 'faculty_admin', 'related_unit', 'faculty_leadership')
    `);

    await queryRunner.query(`
      CREATE TYPE "feedback_status_enum" AS ENUM ('submitted', 'processing', 'completed', 'rejected')
    `);

    await queryRunner.query(`
      CREATE TYPE "notification_type_enum" AS ENUM ('feedback_submitted', 'status_changed', 'response_added', 'assigned')
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" varchar(255) NOT NULL,
        "email" varchar(255) NOT NULL,
        "password" varchar NOT NULL,
        "role" "user_role_enum" NOT NULL DEFAULT 'end_user',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" SERIAL NOT NULL,
        "category_name" varchar(100) NOT NULL,
        "description" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_categories" PRIMARY KEY ("id")
      )
    `);

    // Create feedbacks table
    await queryRunner.query(`
      CREATE TABLE "feedbacks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "category_id" integer NOT NULL,
        "content" text NOT NULL,
        "subject" varchar(255),
        "submission_date" TIMESTAMP NOT NULL DEFAULT now(),
        "status" "feedback_status_enum" NOT NULL DEFAULT 'submitted',
        "is_anonymous" boolean NOT NULL DEFAULT false,
        "assigned_unit_id" uuid,
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_feedbacks" PRIMARY KEY ("id")
      )
    `);

    // Create responses table
    await queryRunner.query(`
      CREATE TABLE "responses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "report_id" uuid NOT NULL,
        "admin_id" uuid NOT NULL,
        "message" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_responses" PRIMARY KEY ("id")
      )
    `);

    // Create notifications table
    await queryRunner.query(`
      CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid NOT NULL,
        "title" varchar(255) NOT NULL,
        "message" text NOT NULL,
        "type" "notification_type_enum" NOT NULL DEFAULT 'feedback_submitted',
        "reference_id" uuid,
        "is_read" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notifications" PRIMARY KEY ("id")
      )
    `);

    // Create attachments table
    await queryRunner.query(`
      CREATE TABLE "attachments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "feedback_id" uuid NOT NULL,
        "file_name" varchar(255) NOT NULL,
        "original_name" varchar(255) NOT NULL,
        "file_path" varchar(500) NOT NULL,
        "file_size" integer NOT NULL,
        "mime_type" varchar(100) NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_attachments" PRIMARY KEY ("id")
      )
    `);

    // Create uuid extension if not exists
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "feedbacks" 
      ADD CONSTRAINT "FK_feedbacks_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "feedbacks" 
      ADD CONSTRAINT "FK_feedbacks_category" 
      FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "feedbacks" 
      ADD CONSTRAINT "FK_feedbacks_assigned_unit" 
      FOREIGN KEY ("assigned_unit_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "responses" 
      ADD CONSTRAINT "FK_responses_feedback" 
      FOREIGN KEY ("report_id") REFERENCES "feedbacks"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "responses" 
      ADD CONSTRAINT "FK_responses_admin" 
      FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT
    `);

    await queryRunner.query(`
      ALTER TABLE "notifications" 
      ADD CONSTRAINT "FK_notifications_user" 
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "attachments" 
      ADD CONSTRAINT "FK_attachments_feedback" 
      FOREIGN KEY ("feedback_id") REFERENCES "feedbacks"("id") ON DELETE CASCADE
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_feedbacks_user_id" ON "feedbacks" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_feedbacks_category_id" ON "feedbacks" ("category_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_feedbacks_status" ON "feedbacks" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_feedbacks_submission_date" ON "feedbacks" ("submission_date")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_notifications_is_read" ON "notifications" ("is_read")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_notifications_is_read"`);
    await queryRunner.query(`DROP INDEX "IDX_notifications_user_id"`);
    await queryRunner.query(`DROP INDEX "IDX_feedbacks_submission_date"`);
    await queryRunner.query(`DROP INDEX "IDX_feedbacks_status"`);
    await queryRunner.query(`DROP INDEX "IDX_feedbacks_category_id"`);
    await queryRunner.query(`DROP INDEX "IDX_feedbacks_user_id"`);

    // Drop foreign key constraints
    await queryRunner.query(`ALTER TABLE "attachments" DROP CONSTRAINT "FK_attachments_feedback"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user"`);
    await queryRunner.query(`ALTER TABLE "responses" DROP CONSTRAINT "FK_responses_admin"`);
    await queryRunner.query(`ALTER TABLE "responses" DROP CONSTRAINT "FK_responses_feedback"`);
    await queryRunner.query(`ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_feedbacks_assigned_unit"`);
    await queryRunner.query(`ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_feedbacks_category"`);
    await queryRunner.query(`ALTER TABLE "feedbacks" DROP CONSTRAINT "FK_feedbacks_user"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "attachments"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "responses"`);
    await queryRunner.query(`DROP TABLE "feedbacks"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enum types
    await queryRunner.query(`DROP TYPE "notification_type_enum"`);
    await queryRunner.query(`DROP TYPE "feedback_status_enum"`);
    await queryRunner.query(`DROP TYPE "user_role_enum"`);
  }
}
