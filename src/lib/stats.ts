// Pure math for the dashboard: no database, so it's easy to test and explain.

export const DEFAULT_CALORIE_GOAL = 2200;

export type DayTotal = { day: string; calories: number; proteinG: number };

export type DashboardStats = {
  daysLogged: number;
  avgDailyCalories: number;
  avgDailyProtein: number;
  daysOnGoal: number;
};

/**
 * Averages count only days with something logged: a day I didn't log is
 * "no data", not "ate nothing", so it shouldn't drag the average down.
 * A day is "on goal" when its calories are at or under the goal.
 */
export function computeDashboardStats(days: DayTotal[], goal: number): DashboardStats {
  const logged = days.filter((d) => d.calories > 0);
  if (logged.length === 0) {
    return { daysLogged: 0, avgDailyCalories: 0, avgDailyProtein: 0, daysOnGoal: 0 };
  }
  const totalCalories = logged.reduce((sum, d) => sum + d.calories, 0);
  const totalProtein = logged.reduce((sum, d) => sum + d.proteinG, 0);
  return {
    daysLogged: logged.length,
    avgDailyCalories: Math.round(totalCalories / logged.length),
    avgDailyProtein: Math.round((totalProtein / logged.length) * 10) / 10,
    daysOnGoal: logged.filter((d) => d.calories <= goal).length,
  };
}
