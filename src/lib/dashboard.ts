import { and, count, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "@/db";
import { logEntries, meals } from "@/db/schema";
import { addDays } from "./dates";
import { computeDashboardStats, type DashboardStats, type DayTotal } from "./stats";

export const DASHBOARD_DAYS = 14;

export type Dashboard = {
  days: DayTotal[]; // oldest to newest, one per day, zeros where nothing was logged
  stats: DashboardStats;
  topMeal: { name: string; times: number } | null;
  goal: number;
};

export async function getDashboard(userId: string, today: string, goal: number): Promise<Dashboard> {
  const from = addDays(today, -(DASHBOARD_DAYS - 1));
  const inRange = and(
    eq(logEntries.userId, userId),
    gte(logEntries.eatenOn, from),
    lte(logEntries.eatenOn, today),
  );

  // Calories for an entry = meal calories x servings, summed per day.
  const totals = await db
    .select({
      day: logEntries.eatenOn,
      calories: sql<number>`sum(${meals.calories} * ${logEntries.servings})`.mapWith(Number),
      proteinG: sql<number>`sum(${meals.proteinG} * ${logEntries.servings})`.mapWith(Number),
    })
    .from(logEntries)
    .innerJoin(meals, eq(meals.id, logEntries.mealId))
    .where(inRange)
    .groupBy(logEntries.eatenOn);

  const byDay = new Map(totals.map((t) => [t.day, t]));
  const days: DayTotal[] = Array.from({ length: DASHBOARD_DAYS }, (_, i) => {
    const day = addDays(from, i);
    const t = byDay.get(day);
    return { day, calories: t ? Math.round(t.calories) : 0, proteinG: t ? t.proteinG : 0 };
  });

  const [top] = await db
    .select({ name: meals.name, times: count(logEntries.id) })
    .from(logEntries)
    .innerJoin(meals, eq(meals.id, logEntries.mealId))
    .where(inRange)
    .groupBy(meals.id, meals.name)
    .orderBy(desc(count(logEntries.id)), meals.name)
    .limit(1);

  return {
    days,
    stats: computeDashboardStats(days, goal),
    topMeal: top ? { name: top.name, times: Number(top.times) } : null,
    goal,
  };
}
