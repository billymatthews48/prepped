import { z } from "zod";
import { MEAL_SLOTS } from "@/db/schema";
import type { MealInput } from "./meals";

export type MealField = "name" | "slot" | "calories" | "proteinG" | "notes";
export type MealFieldErrors = Partial<Record<MealField, string>>;

// Mirrors the database CHECK rules in src/db/schema.ts, but with messages a
// person can act on. The database rules are the backstop; these are the UX.
// Form values arrive as text, so each number is checked as text first
// (blank?) and then converted (a number? in range?).
const mealSchema = z.object({
  name: z.string().trim().min(1, "Give the meal a name.").max(80, "Keep the name under 80 characters."),
  slot: z.enum(MEAL_SLOTS, "Pick breakfast, lunch, dinner, or snack."),
  calories: z
    .string()
    .trim()
    .min(1, "Enter the calories per serving.")
    .pipe(
      z.coerce
        .number<string>("Calories need to be a number.")
        .gt(0, "Calories must be more than 0.")
        .max(10000, "That's a lot of calories for one serving. Double-check it."),
    )
    .transform(Math.round),
  proteinG: z
    .string()
    .trim()
    .transform((s) => (s === "" ? "0" : s))
    .pipe(
      z.coerce
        .number<string>("Protein needs to be a number.")
        .min(0, "Protein can't be negative.")
        .max(1000, "That's more protein than a serving can have. Double-check it."),
    ),
  notes: z
    .string()
    .trim()
    .max(1000, "Keep notes under 1,000 characters.")
    .transform((s) => s || null),
});

export type MealParseResult = { ok: true; data: MealInput } | { ok: false; fieldErrors: MealFieldErrors };

export function parseMeal(values: Record<MealField, string>): MealParseResult {
  const result = mealSchema.safeParse(values);
  if (result.success) return { ok: true, data: result.data };

  const fieldErrors: MealFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as MealField;
    fieldErrors[field] ??= issue.message;
  }
  return { ok: false, fieldErrors };
}

const macrosSchema = mealSchema.pick({ calories: true, proteinG: true });

/**
 * Calories and protein typed in when logging a library food. Same rules as the
 * meal form; returns the first problem as one message.
 */
export function parseMacros(values: { calories: string; proteinG: string }):
  | { ok: true; data: { calories: number; proteinG: number } }
  | { ok: false; error: string } {
  const result = macrosSchema.safeParse(values);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, error: result.error.issues[0].message };
}

/** Servings for a log entry: blank means 1; otherwise a number above 0, at most 20. */
export function parseServings(raw: string): { ok: true; servings: number } | { ok: false; error: string } {
  if (raw.trim() === "") return { ok: true, servings: 1 };
  const servings = Number(raw);
  if (!Number.isFinite(servings)) return { ok: false, error: "Servings need to be a number." };
  if (servings <= 0) return { ok: false, error: "Servings must be more than 0." };
  if (servings > 20) return { ok: false, error: "That's more than 20 servings. Double-check it." };
  return { ok: true, servings };
}
