import { eq } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { DEFAULT_CALORIE_GOAL } from "./stats";

export const GOAL_MIN = 800;
export const GOAL_MAX = 6000;

export async function getCalorieGoal(userId: string): Promise<number> {
  const [row] = await db
    .select({ goal: users.dailyCalorieGoal })
    .from(users)
    .where(eq(users.id, userId));
  return row?.goal ?? DEFAULT_CALORIE_GOAL;
}

export async function setCalorieGoal(userId: string, goal: number): Promise<void> {
  await db.update(users).set({ dailyCalorieGoal: goal, updatedAt: new Date() }).where(eq(users.id, userId));
}

/** A whole number of calories between GOAL_MIN and GOAL_MAX, or a friendly error. */
export function parseGoal(raw: string): { ok: true; goal: number } | { ok: false; error: string } {
  if (raw.trim() === "") return { ok: false, error: "Enter a daily calorie goal." };
  const goal = Math.round(Number(raw));
  if (!Number.isFinite(goal)) return { ok: false, error: "Your goal needs to be a number." };
  if (goal < GOAL_MIN || goal > GOAL_MAX) {
    return { ok: false, error: `Pick a goal between ${GOAL_MIN.toLocaleString()} and ${GOAL_MAX.toLocaleString()} calories.` };
  }
  return { ok: true, goal };
}

/** What the progress bar shows: how full, and how much is left (or over). */
export function goalProgress(eaten: number, goal: number) {
  const remaining = Math.round(goal - eaten);
  return {
    percent: Math.min(100, Math.round((eaten / goal) * 100)),
    remaining: Math.max(0, remaining),
    over: Math.max(0, -remaining),
    isOver: eaten > goal,
  };
}
