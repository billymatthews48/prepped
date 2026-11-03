import type { MealSlot } from "@/db/schema";

export const SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snack",
};

const wholeNumber = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const oneDecimal = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

/** 2,150 */
export function formatCalories(value: number): string {
  return wholeNumber.format(value);
}

/** 42.5 (one decimal at most) */
export function formatGrams(value: number): string {
  return oneDecimal.format(value);
}

export const MEAL_SORTS = {
  newest: "Newest",
  calories: "Most calories",
  protein: "Most protein",
  logged: "Most logged",
} as const;
export type MealSort = keyof typeof MEAL_SORTS;
