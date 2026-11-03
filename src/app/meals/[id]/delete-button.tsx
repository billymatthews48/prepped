"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui";

function ConfirmDeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="danger" disabled={pending}>
      {pending ? "Deleting…" : "Yes, delete"}
    </Button>
  );
}

export function DeleteMealButton({ mealName, action }: { mealName: string; action: () => Promise<void> }) {
  const [open, setOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <Button variant="secondary" className="text-danger" onClick={() => setOpen(true)}>
        Delete
      </Button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            aria-describedby="delete-desc"
            className="w-full max-w-sm rounded-2xl bg-surface p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="delete-title" className="mb-1 text-lg font-bold">
              Are you sure?
            </h2>
            <p id="delete-desc" className="mb-5 text-sm text-muted">
              This deletes <strong className="text-foreground">{mealName}</strong> and every time you logged it.
              It can&apos;t be undone.
            </p>
            <form action={action} className="flex justify-end gap-3">
              <Button ref={cancelRef} type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <ConfirmDeleteButton />
            </form>
          </div>
        </div>
      )}
    </>
  );
}
