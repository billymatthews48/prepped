import { describe, expect, it } from "vitest";
import { computeStreak } from "./streak";

const today = "2026-11-04";

describe("logging streak", () => {
  it("counts consecutive days ending today", () => {
    expect(computeStreak(["2026-11-02", "2026-11-03", "2026-11-04"], today)).toEqual({
      current: 3,
      best: 3,
      loggedToday: true,
    });
  });

  it("keeps yesterday's streak alive before I've logged today", () => {
    expect(computeStreak(["2026-11-02", "2026-11-03"], today).current).toBe(2);
  });

  it("resets after a missed day, but remembers the best run", () => {
    const days = ["2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31", "2026-11-02", "2026-11-04"];
    expect(computeStreak(days, today)).toEqual({ current: 1, best: 4, loggedToday: true });
  });

  it("is 0 with no logs, or when the last log was two days ago", () => {
    expect(computeStreak([], today).current).toBe(0);
    expect(computeStreak(["2026-11-02"], today).current).toBe(0);
  });

  it("works across a month boundary", () => {
    expect(computeStreak(["2026-10-30", "2026-10-31", "2026-11-01"], "2026-11-01").current).toBe(3);
  });
});
