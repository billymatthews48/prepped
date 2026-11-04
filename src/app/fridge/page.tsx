import type { Metadata } from "next";
import Link from "next/link";
import { ServingsMeter } from "@/components/servings-meter";
import { ButtonLink, Card, PageHeader } from "@/components/ui";
import { QuickLogButton } from "@/app/meals/[id]/quick-log";
import { listActiveBatches } from "@/lib/batches";
import { formatDay } from "@/lib/dates";
import { SLOT_LABELS, formatCalories } from "@/lib/format";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Fridge · Prepped" };

export default async function FridgePage() {
  const user = await requireUser();
  const active = await listActiveBatches(user.id);
  const totalServings = active.reduce((sum, b) => sum + b.servingsLeft, 0);

  return (
    <>
      <PageHeader title="In the fridge" />
      {active.length === 0 ? (
        <Card className="text-center">
          <p className="mb-1 font-semibold">Nothing prepped right now</p>
          <p className="mb-4 text-sm text-muted">
            Open a meal and add a batch after your next prep session.
          </p>
          <ButtonLink href="/meals" variant="secondary">
            Go to meals
          </ButtonLink>
        </Card>
      ) : (
        <>
          <p className="-mt-4 mb-4 text-sm text-muted">
            {totalServings} serving{totalServings === 1 ? "" : "s"} left across {active.length} batch
            {active.length === 1 ? "" : "es"}, oldest first.
          </p>
          <ul className="flex flex-col gap-3">
            {active.map((batch) => (
              <li key={batch.id}>
                <Card className="!p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/meals/${batch.mealId}`} className="block truncate font-semibold hover:underline">
                        {batch.mealName}
                      </Link>
                      <p className="text-sm text-muted">
                        {SLOT_LABELS[batch.slot]} · {formatCalories(batch.calories)} cal · prepped {formatDay(batch.preppedOn)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <ServingsMeter left={batch.servingsLeft} made={batch.servingsMade} />
                    <QuickLogButton mealId={batch.mealId} batchId={batch.id} label="Eat 1 serving" />
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  );
}
