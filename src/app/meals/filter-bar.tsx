"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { MEAL_SLOTS } from "@/db/schema";
import { MEAL_SORTS, SLOT_LABELS } from "@/lib/format";

const control =
  "rounded-xl border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft";

export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [search, setSearch] = useState(params.get("q") ?? "");
  const [pending, startTransition] = useTransition();
  const firstRender = useRef(true);

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    const query = next.toString();
    startTransition(() => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }));
  }

  // Search as you type, but wait for a short pause so every keystroke isn't a request.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => update("q", search.trim()), 250);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className={`mb-4 flex flex-col gap-2 sm:flex-row ${pending ? "opacity-70" : ""}`}>
      <input
        type="search"
        aria-label="Search meals"
        placeholder="Search meals…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={`${control} flex-1`}
      />
      <div className="flex gap-2">
        <select
          aria-label="Filter by meal slot"
          value={params.get("slot") ?? ""}
          onChange={(e) => update("slot", e.target.value)}
          className={`${control} flex-1`}
        >
          <option value="">All slots</option>
          {MEAL_SLOTS.map((slot) => (
            <option key={slot} value={slot}>
              {SLOT_LABELS[slot]}
            </option>
          ))}
        </select>
        <select
          aria-label="Sort meals"
          value={params.get("sort") ?? "newest"}
          onChange={(e) => update("sort", e.target.value === "newest" ? "" : e.target.value)}
          className={`${control} flex-1`}
        >
          {Object.entries(MEAL_SORTS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
