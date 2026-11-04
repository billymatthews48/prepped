import { DEFAULT_TIME_ZONE } from "./dates";
import { formatCalories, formatGrams } from "./format";

/** The hour (0–23) right now in the given IANA time zone. */
export function hourIn(timeZone: string, now: Date = new Date()): number {
  const format = (tz: string) =>
    Number(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hourCycle: "h23" }).format(now));
  try {
    return format(timeZone);
  } catch {
    return format(DEFAULT_TIME_ZONE);
  }
}

/** "Good morning" 5am–noon, "Good afternoon" until 5pm, otherwise "Good evening". */
export function timeOfDayGreeting(hour: number): string {
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

/** First word of the account name ("Billy Matthews" → "Billy"), or "there". */
export function firstName(name: string): string {
  return name.trim().split(/\s+/)[0] || "there";
}

/** One line under the greeting about where today stands. */
export function daySummary(day: {
  entries: number;
  calories: number;
  calorieGoal: number;
  proteinG: number;
  proteinGoal: number | null;
}): string {
  if (day.entries === 0) return "Nothing logged yet today. What did you eat first?";
  const left = Math.round(day.calorieGoal - day.calories);
  const proteinLeft = day.proteinGoal === null ? 0 : Math.round(day.proteinGoal - day.proteinG);
  const protein = proteinLeft > 0 ? `${formatGrams(proteinLeft)} g of protein` : null;

  if (left > 0) return protein ? `${formatCalories(left)} cal and ${protein} left today.` : `${formatCalories(left)} cal left today.`;
  const status = left === 0 ? "Right on your calorie goal" : `${formatCalories(-left)} cal over your goal`;
  return protein ? `${status}, with ${protein} still to go.` : `${status} today.`;
}
