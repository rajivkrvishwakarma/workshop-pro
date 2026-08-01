ALTER TABLE "workshop_users" ALTER COLUMN "auth_user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ALTER COLUMN "preview_image_id" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "workshop_users" ADD COLUMN "email" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "workshop_users" ADD COLUMN "password_hash" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "workshop_users" ADD COLUMN "first_name" varchar(100);--> statement-breakpoint
ALTER TABLE "workshop_users" ADD COLUMN "last_name" varchar(100);--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "design_data" jsonb;--> statement-breakpoint
ALTER TABLE "workshop_users" ADD CONSTRAINT "workshop_users_email_unique" UNIQUE("email");