import { describe, expect, it } from "vitest";
import { daySummary, firstName, hourIn, timeOfDayGreeting } from "./greeting";

describe("greeting", () => {
  it("uses the hour in my own time zone, not the server's", () => {
    const now = new Date("2026-11-04T05:30:00Z"); // 9:30pm Nov 3 in California
    expect(hourIn("America/Los_Angeles", now)).toBe(21);
    expect(hourIn("Europe/London", now)).toBe(5);
    expect(hourIn("Not/AZone", now)).toBe(21); // falls back to Pacific
  });

  it("picks morning, afternoon or evening", () => {
    expect([4, 5, 11, 12, 16, 17, 23].map(timeOfDayGreeting)).toEqual([
      "Good evening",
      "Good morning",
      "Good morning",
      "Good afternoon",
      "Good afternoon",
      "Good evening",
      "Good evening",
    ]);
  });

  it("greets by first name", () => {
    expect(firstName("Billy Matthews")).toBe("Billy");
    expect(firstName("  Ada ")).toBe("Ada");
    expect(firstName("")).toBe("there");
  });

  it("sums up the day in one line", () => {
    const base = { calorieGoal: 2200, proteinGoal: 160 };
    expect(daySummary({ ...base, entries: 0, calories: 0, proteinG: 0 })).toBe(
      "Nothing logged yet today. What did you eat first?",
    );
    expect(daySummary({ ...base, entries: 2, calories: 1450, proteinG: 100 })).toBe(
      "750 cal and 60 g of protein left today.",
    );
    expect(daySummary({ ...base, entries: 5, calories: 2290, proteinG: 136 })).toBe(
      "90 cal over your goal, with 24 g of protein still to go.",
    );
    expect(daySummary({ ...base, proteinGoal: null, entries: 1, calories: 2200, proteinG: 50 })).toBe(
      "Right on your calorie goal today.",
    );
  });
});
