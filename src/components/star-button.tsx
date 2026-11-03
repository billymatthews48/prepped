"use client";

import { useOptimistic, useTransition } from "react";
import { setStarAction } from "@/app/meals/star-actions";

export function StarButton({
  mealId,
  mealName,
  starred,
  size = "md",
}: {
  mealId: number;
  mealName: string;
  starred: boolean;
  size?: "md" | "lg";
}) {
  const [optimisticStarred, setOptimisticStarred] = useOptimistic(starred);
  const [, startTransition] = useTransition();

  function toggle(event: React.MouseEvent) {
    // Stars sit inside clickable meal cards; don't open the meal too.
    event.preventDefault();
    event.stopPropagation();
    const next = !optimisticStarred;
    startTransition(async () => {
      setOptimisticStarred(next);
      await setStarAction(mealId, next);
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={optimisticStarred}
      aria-label={optimisticStarred ? `Unstar ${mealName}` : `Star ${mealName}`}
      title={optimisticStarred ? "Starred" : "Star this meal"}
      className={`shrink-0 rounded-lg leading-none transition-transform hover:scale-110 ${
        size === "lg" ? "p-1.5 text-3xl" : "p-1 text-2xl"
      } ${optimisticStarred ? "text-amber-400" : "text-slate-300 hover:text-amber-300"}`}
    >
      {optimisticStarred ? "★" : "☆"}
    </button>
  );
}
