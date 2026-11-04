CREATE TABLE "batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"meal_id" integer NOT NULL,
	"servings_made" double precision NOT NULL,
	"prepped_on" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "batches_servings_made_positive" CHECK ("batches"."servings_made" > 0)
);
--> statement-breakpoint
ALTER TABLE "log_entries" ADD COLUMN "batch_id" integer;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_meal_id_meals_id_fk" FOREIGN KEY ("meal_id") REFERENCES "public"."meals"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "batches_user_meal_idx" ON "batches" USING btree ("user_id","meal_id");--> statement-breakpoint
ALTER TABLE "log_entries" ADD CONSTRAINT "log_entries_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "log_entries_batch_idx" ON "log_entries" USING btree ("batch_id");