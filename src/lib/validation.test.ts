import { describe, expect, it } from "vitest";
import { parseMeal, parseServings } from "./validation";

const valid = { name: "Chicken & rice", slot: "lunch", calories: "550", proteinG: "42", notes: "" };

describe("meal validation", () => {
  it("accepts a valid meal and cleans it up", () => {
    expect(parseMeal({ ...valid, name: "  Chicken & rice ", calories: "549.6" })).toEqual({
      ok: true,
      data: { name: "Chicken & rice", slot: "lunch", calories: 550, proteinG: 42, notes: null },
    });
  });

  it("treats blank protein as 0", () => {
    const result = parseMeal({ ...valid, proteinG: "" });
    expect(result.ok && result.data.proteinG).toBe(0);
  });

  it.each([
    ["name", { name: "   " }, "Give the meal a name."],
    ["calories", { calories: "" }, "Enter the calories per serving."],
    ["calories", { calories: "0" }, "Calories must be more than 0."],
    ["calories", { calories: "-200" }, "Calories must be more than 0."],
    ["calories", { calories: "lots" }, "Calories need to be a number."],
    ["proteinG", { proteinG: "-5" }, "Protein can't be negative."],
    ["slot", { slot: "brunch" }, "Pick breakfast, lunch, dinner, or snack."],
  ])("rejects a bad %s with a friendly message", (field, change, message) => {
    expect(parseMeal({ ...valid, ...change })).toEqual({ ok: false, fieldErrors: { [field]: message } });
  });
});

describe("servings validation", () => {
  it.each([
    ["", { ok: true, servings: 1 }],
    ["1.5", { ok: true, servings: 1.5 }],
    ["0", { ok: false, error: "Servings must be more than 0." }],
    ["-1", { ok: false, error: "Servings must be more than 0." }],
  ])("%j", (raw, expected) => {
    expect(parseServings(raw)).toEqual(expected);
  });
});
