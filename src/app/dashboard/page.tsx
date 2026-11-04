import type { Metadata } from "next";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { DASHBOARD_DAYS, getDashboard } from "@/lib/dashboard";
import { formatCalories, formatGrams } from "@/lib/format";
import { requireUser } from "@/lib/session";
import { getCalorieGoal } from "@/lib/goal";
import { getStreak } from "@/lib/streak";
import { today } from "@/lib/today";
import { CalorieChart } from "./calorie-chart";

export const metadata: Metadata = { title: "Dashboard · Prepped" };

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="!p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="truncate text-2xl font-bold tabular-nums">{value}</p>
      {sub && <p className="truncate text-xs text-muted">{sub}</p>}
    </Card>
  );
}

export default async function DashboardPage() {
  const user = await requireUser();
  const todayDay = await today();
  const [{ days, stats, topMeal, goal }, streak] = await Promise.all([
    getDashboard(user.id, todayDay, await getCalorieGoal(user.id)),
    getStreak(user.id, todayDay),
  ]);

  return (
    <>
      <PageHeader title="Dashboard" />
      <p className="-mt-4 mb-5 text-sm text-muted">Last {DASHBOARD_DAYS} days. Averages count only days you logged.</p>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Avg daily calories" value={formatCalories(stats.avgDailyCalories)} sub={`over ${stats.daysLogged} logged day${stats.daysLogged === 1 ? "" : "s"}`} />
        <Stat label="Avg daily protein" value={`${formatGrams(stats.avgDailyProtein)} g`} />
        <Stat
          label="Days on goal"
          value={`${stats.daysOnGoal} / ${stats.daysLogged}`}
          sub={`at or under ${formatCalories(goal)}`}
        />
        <Stat label="Most-logged meal" value={topMeal?.name ?? "—"} sub={topMeal ? `${topMeal.times}×` : "nothing logged yet"} />
        <Stat
          label="Logging streak"
          value={`${streak.current} day${streak.current === 1 ? "" : "s"}`}
          sub={`best: ${streak.best} day${streak.best === 1 ? "" : "s"}`}
        />
      </div>

      <Card>
        <h2 className="mb-2 font-semibold">Calories per day</h2>
        {stats.daysLogged === 0 ? (
          <div className="flex flex-col items-start gap-3 py-6">
            <p className="text-sm text-muted">Log a few meals and your chart shows up here.</p>
            <ButtonLink href="/today">Log a meal</ButtonLink>
          </div>
        ) : (
          <>
            <CalorieChart days={days} goal={goal} />
            <p className="mt-2 flex gap-4 text-xs text-muted">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-accent" /> At or under goal
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-warn" /> Over goal
              </span>
            </p>
          </>
        )}
      </Card>
    </>
  );
}
