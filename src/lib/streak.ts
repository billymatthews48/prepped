import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { logEntries } from "@/db/schema";
import { addDays } from "./dates";

export type Streak = { current: number; best: number; loggedToday: boolean };

/**
 * Pure streak math over the days that have at least one log entry.
 * "Current" counts back from today; if today has nothing yet, it counts back
 * from yesterday instead, so the streak doesn't read 0 before breakfast.
 */
export function computeStreak(loggedDays: string[], today: string): Streak {
  const days = new Set(loggedDays);
  const loggedToday = days.has(today);

  let current = 0;
  for (let day = loggedToday ? today : addDays(today, -1); days.has(day); day = addDays(day, -1)) {
    current++;
  }

  let best = 0;
  let run = 0;
  let previous: string | null = null;
  for (const day of [...days].sort()) {
    run = previous && addDays(previous, 1) === day ? run + 1 : 1;
    best = Math.max(best, run);
    previous = day;
  }

  return { current, best, loggedToday };
}

export async function getStreak(userId: string, today: string): Promise<Streak> {
  const rows = await db
    .selectDistinct({ day: logEntries.eatenOn })
    .from(logEntries)
    .where(eq(logEntries.userId, userId))
    .orderBy(asc(logEntries.eatenOn));
  return computeStreak(
    rows.map((r) => r.day).filter((d) => d <= today),
    today,
  );
}
