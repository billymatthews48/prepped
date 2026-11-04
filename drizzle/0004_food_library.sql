CREATE TABLE "foods" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"serving" text NOT NULL,
	"slot" text NOT NULL,
	"calories" integer NOT NULL,
	"protein_g" double precision DEFAULT 0 NOT NULL,
	CONSTRAINT "foods_name_unique" UNIQUE("name"),
	CONSTRAINT "foods_calories_positive" CHECK ("foods"."calories" > 0),
	CONSTRAINT "foods_protein_not_negative" CHECK ("foods"."protein_g" >= 0),
	CONSTRAINT "foods_slot_valid" CHECK ("foods"."slot" in ('breakfast', 'lunch', 'dinner', 'snack'))
);
--> statement-breakpoint
ALTER TABLE "meals" ADD COLUMN "food_id" integer;--> statement-breakpoint
ALTER TABLE "meals" ADD CONSTRAINT "meals_food_id_foods_id_fk" FOREIGN KEY ("food_id") REFERENCES "public"."foods"("id") ON DELETE set null ON UPDATE no action;