import type { Metadata } from "next";
import { logOutAction } from "@/app/(auth)/actions";
import { Avatar } from "@/components/avatar";
import { Button, ButtonLink, Card } from "@/components/ui";
import { formatCalories } from "@/lib/format";
import { getCalorieGoal, getProteinGoal } from "@/lib/goal";
import { listMeals } from "@/lib/meals";
import { requireUser } from "@/lib/session";
import { starredMealIds } from "@/lib/stars";
import { getStreak } from "@/lib/streak";
import { today, visitorTimeZone } from "@/lib/today";

export const metadata: Metadata = { title: "Profile · Prepped" };

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-background p-4">
      <p className="text-sm text-muted">{label}</p>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
    </div>
  );
}

const days = (n: number) => `${n} day${n === 1 ? "" : "s"}`;

export default async function ProfilePage() {
  const user = await requireUser();
  const [calorieGoal, proteinGoal, meals, starred, streak, timeZone] = await Promise.all([
    getCalorieGoal(user.id),
    getProteinGoal(user.id),
    listMeals(user.id),
    starredMealIds(user.id),
    today().then((day) => getStreak(user.id, day)),
    visitorTimeZone(),
  ]);
  const joined = user.createdAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone,
  });

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <div className="flex items-center gap-4">
          <Avatar name={user.name} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-bold tracking-tight">{user.name}</h1>
            <p className="truncate text-sm text-muted">{user.email}</p>
            <p className="text-sm text-muted">Member since {joined}</p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Daily goals</h2>
          <ButtonLink href="/setup" variant="secondary">
            {proteinGoal === null ? "Set targets" : "Redo targets"}
          </ButtonLink>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Tile label="Calories" value={formatCalories(calorieGoal)} />
          <Tile label="Protein" value={proteinGoal === null ? "Not set" : `${proteinGoal} g`} />
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 font-semibold">Your Prepped</h2>
        <div className="grid grid-cols-2 gap-3">
          <Tile label="Meals saved" value={String(meals.length)} />
          <Tile label="Starred" value={String(starred.size)} />
          <Tile label="Logging streak" value={days(streak.current)} />
          <Tile label="Best streak" value={days(streak.best)} />
        </div>
      </Card>

      <form action={logOutAction}>
        <Button type="submit" variant="secondary" className="w-full">
          Log out
        </Button>
      </form>
    </div>
  );
}
