import { beforeAll, describe, expect, it } from "vitest";
import { migrateTestDb, signUpAndLogIn } from "@/test/setup-db";
import { getCalorieGoal, getProteinGoal, setTargets } from "./goal";
import { ageOn, computeTargets, parseTargetAnswers, type TargetFormValues } from "./targets";

// Stranger-test follow-up (Issue #39): the questionnaire on /setup.

describe("calorie and protein targets", () => {
  it("works out a known example by hand", () => {
    // Resting: 10×80 + 6.25×180 − 5×30 + 5 = 1,780. Moderate (×1.55) = 2,759 → 2,760.
    const base = { sex: "male", age: 30, heightCm: 180, weightKg: 80, activity: "moderate" } as const;

    expect(computeTargets({ ...base, goal: "maintain" })).toEqual({
      restingCalories: 1780,
      maintenanceCalories: 2760,
      calories: 2760,
      proteinG: 130, // 1.6 g/kg × 80 = 128 → 130
    });
    expect(computeTargets({ ...base, goal: "lose" })).toMatchObject({ calories: 2260, proteinG: 160 });
    expect(computeTargets({ ...base, goal: "gain" })).toMatchObject({ calories: 3010, proteinG: 145 });
  });

  it("never suggests fewer than 1,200 calories", () => {
    // Resting 1,320 × 1.2 = 1,584, minus 500 = 1,084, which is too low
    const targets = computeTargets({
      sex: "female",
      age: 30,
      heightCm: 165,
      weightKg: 60,
      activity: "sedentary",
      goal: "lose",
    });
    expect(targets.calories).toBe(1200);
  });

  const today = "2026-11-03";
  const answers: TargetFormValues = {
    units: "imperial",
    sex: "male",
    dob: "1996-05-20",
    heightFt: "5",
    heightIn: "11",
    heightCm: "",
    weight: "176",
    activity: "moderate",
    goal: "maintain",
  };

  it("converts feet, inches and pounds to metric", () => {
    const parsed = parseTargetAnswers(answers, today);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.answers.age).toBe(30);
    expect(parsed.answers.heightCm).toBeCloseTo(180.34, 2);
    expect(parsed.answers.weightKg).toBeCloseTo(79.83, 2);
  });

  it("takes centimetres and kilograms as they are in metric", () => {
    const parsed = parseTargetAnswers({ ...answers, units: "metric", heightCm: "180", weight: "80" }, today);
    expect(parsed).toMatchObject({ ok: true, answers: { heightCm: 180, weightKg: 80 } });
    // Same person, either units: the same targets
    if (parsed.ok) expect(computeTargets(parsed.answers).calories).toBe(2760);
  });

  it("works out age from date of birth, one year younger until the birthday", () => {
    expect(ageOn("1996-11-04", "2026-11-03")).toBe(29); // birthday is tomorrow
    expect(ageOn("1996-11-03", "2026-11-03")).toBe(30); // birthday is today
    expect(ageOn("1996-02-29", "2026-02-28")).toBe(29); // leap-day birthday, not yet
  });

  it("gives a friendly message for each missing or impossible answer", () => {
    const parsed = parseTargetAnswers(
      {
        units: "imperial",
        sex: "",
        dob: "2010-01-01",
        heightFt: "",
        heightIn: "",
        heightCm: "",
        weight: "5000",
        activity: "couch",
        goal: "",
      },
      today,
    );
    expect(parsed).toEqual({
      ok: false,
      fieldErrors: {
        sex: "Pick one. The calorie formula uses it.",
        dob: "This calculator is for adults, 18 and over.",
        height: "Enter your height in feet and inches.",
        weight: "Double-check your weight.",
        activity: "Pick how active you are.",
        goal: "Pick a goal.",
      },
    });
  });

  it("rejects a blank, made-up or future date of birth", () => {
    const dobError = (dob: string) => {
      const parsed = parseTargetAnswers({ ...answers, dob }, today);
      return parsed.ok ? null : parsed.fieldErrors.dob;
    };
    expect(dobError("")).toBe("Enter your date of birth.");
    expect(dobError("1996-02-30")).toBe("Enter your date of birth.");
    expect(dobError("2027-01-01")).toBe("That date is in the future.");
  });
});

describe("saving targets", () => {
  let ada: string;
  let ben: string;

  beforeAll(async () => {
    await migrateTestDb();
    ada = (await signUpAndLogIn("Ada", "ada-targets@example.com")).id;
    ben = (await signUpAndLogIn("Ben", "ben-targets@example.com")).id;
  });

  it("starts at the 2,200 default with no protein goal", async () => {
    expect(await getCalorieGoal(ada)).toBe(2200);
    expect(await getProteinGoal(ada)).toBeNull();
  });

  it("saves both goals for me and leaves everyone else's alone", async () => {
    await setTargets(ada, { calories: 2260, proteinG: 160 });
    expect(await getCalorieGoal(ada)).toBe(2260);
    expect(await getProteinGoal(ada)).toBe(160);

    expect(await getCalorieGoal(ben)).toBe(2200);
    expect(await getProteinGoal(ben)).toBeNull();
  });
});
