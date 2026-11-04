import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink, Card } from "@/components/ui";
import { MEAL_SLOTS } from "@/db/schema";
import { addDays, formatDay, isIsoDay } from "@/lib/dates";
import { SLOT_LABELS, formatCalories, formatGrams } from "@/lib/format";
import { listEntriesForDay, totals } from "@/lib/log";
import { listMeals } from "@/lib/meals";
import { requireUser } from "@/lib/session";
import { today } from "@/lib/today";
import { getCalorieGoal, goalProgress } from "@/lib/goal";
import { getStreak } from "@/lib/streak";
import { deleteEntryAction } from "./actions";
import { GoalEditor } from "./goal-form";
import { LogForm } from "./log-form";

export const metadata: Metadata = { title: "Today · Prepped" };

export default async function TodayPage({ searchParams }: PageProps<"/today">) {
  const user = await requireUser();
  const todayDay = await today();
  const requested = (await searchParams).date;
  const day = isIsoDay(requested) ? requested : todayDay;
  const isToday = day === todayDay;

  const [entries, meals, goal, streak] = await Promise.all([
    listEntriesForDay(user.id, day),
    listMeals(user.id),
    getCalorieGoal(user.id),
    getStreak(user.id, todayDay),
  ]);
  const dayTotals = totals(entries);
  const progress = goalProgress(dayTotals.calories, goal);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-2">
        <Link
          href={`/today?date=${addDays(day, -1)}`}
          aria-label="Previous day"
          className="rounded-lg px-3 py-1.5 text-lg text-muted hover:bg-surface hover:text-foreground"
        >
          ←
        </Link>
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">{isToday ? "Today" : formatDay(day)}</h1>
          {isToday ? (
            <p className="text-sm text-muted">
              {formatDay(day)}
              {streak.current > 0 && (
                <span
                  className="ml-2 inline-flex items-center gap-1 rounded-full bg-warn-soft px-2 py-0.5 text-xs font-semibold text-warn"
                  title={streak.loggedToday ? "Days in a row with a logged meal" : "Log something today to keep it going"}
                >
                  🔥 {streak.current}-day streak
                </span>
              )}
            </p>
          ) : (
            <Link href="/today" className="text-sm font-medium text-accent hover:underline">
              Back to today
            </Link>
          )}
        </div>
        <Link
          href={`/today?date=${addDays(day, 1)}`}
          aria-label="Next day"
          className="rounded-lg px-3 py-1.5 text-lg text-muted hover:bg-surface hover:text-foreground"
        >
          →
        </Link>
      </div>

      <Card>
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Calories</p>
            <p className="text-3xl font-bold tabular-nums">
              {formatCalories(dayTotals.calories)}
              <span className="text-lg font-semibold text-muted"> / {formatCalories(goal)}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted">Protein</p>
            <p className="text-xl font-bold tabular-nums">{formatGrams(dayTotals.proteinG)} g</p>
          </div>
        </div>
        <div
          role="progressbar"
          aria-label="Calories eaten toward your daily goal"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={Math.round(dayTotals.calories)}
          className="h-3 w-full overflow-hidden rounded-full bg-background"
        >
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${progress.isOver ? "bg-warn" : "bg-accent"}`}
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between gap-3">
          <p className={`text-sm font-medium ${progress.isOver ? "text-warn" : "text-muted"}`}>
            {progress.isOver
              ? `${formatCalories(progress.over)} over your goal`
              : `${formatCalories(progress.remaining)} left`}
          </p>
          <GoalEditor goal={goal} />
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">Log a meal</h2>
        {meals.length === 0 ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-muted">Add a meal first, then log servings of it here.</p>
            <ButtonLink href="/meals/new">Add a meal</ButtonLink>
          </div>
        ) : (
          <LogForm meals={meals} day={day} />
        )}
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">{isToday ? "Eaten today" : "Eaten this day"}</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-muted">Nothing logged yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {MEAL_SLOTS.map((slot) => {
              const slotEntries = entries.filter((e) => e.slot === slot);
              if (slotEntries.length === 0) return null;
              return (
                <section key={slot}>
                  <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
                    {SLOT_LABELS[slot]}
                  </h3>
                  <ul className="divide-y divide-border">
                    {slotEntries.map((entry) => (
                      <li key={entry.id} className="flex items-center justify-between gap-3 py-2">
                        <Link href={`/meals/${entry.mealId}`} className="min-w-0 hover:underline">
                          <span className="block truncate">{entry.mealName}</span>
                          <span className="text-xs text-muted">
                            {entry.servings} serving{entry.servings === 1 ? "" : "s"}
                            {entry.batchPreppedOn && ` · from ${formatDay(entry.batchPreppedOn)} prep`}
                          </span>
                        </Link>
                        <div className="flex shrink-0 items-center gap-2">
                          <span className="text-right text-sm tabular-nums">
                            {formatCalories(entry.calories)} cal
                            <span className="block text-xs text-muted">{formatGrams(entry.proteinG)} g</span>
                          </span>
                          <form action={deleteEntryAction.bind(null, entry.id)}>
                            <button
                              type="submit"
                              aria-label={`Remove ${entry.mealName}`}
                              className="rounded-lg px-2 py-1 text-muted hover:bg-red-50 hover:text-danger"
                            >
                              ×
                            </button>
                          </form>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
