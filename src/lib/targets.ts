// Daily calorie and protein targets from the questionnaire on /setup.
// Pure functions with no database access, so the page can show the targets
// live in the browser and the server can recompute them before saving.

export const SEXES = {
  male: "Male",
  female: "Female",
  unspecified: "Prefer not to say",
} as const;

export const ACTIVITY_LEVELS = {
  sedentary: { label: "Mostly sitting, little exercise", multiplier: 1.2 },
  light: { label: "Exercise 1–3 days a week", multiplier: 1.375 },
  moderate: { label: "Exercise 3–5 days a week", multiplier: 1.55 },
  active: { label: "Hard exercise 6–7 days a week", multiplier: 1.725 },
  athlete: { label: "Physical job, or training twice a day", multiplier: 1.9 },
} as const;

export const GOALS = {
  lose: { label: "Lose weight (about 1 lb a week)", calorieChange: -500, proteinPerKg: 2.0 },
  loseSlowly: { label: "Lose slowly (about ½ lb a week)", calorieChange: -250, proteinPerKg: 2.0 },
  maintain: { label: "Stay where I am", calorieChange: 0, proteinPerKg: 1.6 },
  gain: { label: "Build muscle (gain slowly)", calorieChange: 250, proteinPerKg: 1.8 },
} as const;

export type Sex = keyof typeof SEXES;
export type ActivityLevel = keyof typeof ACTIVITY_LEVELS;
export type Goal = keyof typeof GOALS;

export type TargetAnswers = {
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activity: ActivityLevel;
  goal: Goal;
};

export type Targets = {
  restingCalories: number;
  maintenanceCalories: number;
  calories: number;
  proteinG: number;
};

/** The app never suggests eating less than this, whatever the formula says. */
export const CALORIE_FLOOR = 1200;
const CALORIE_CEILING = 6000;

// Mifflin-St Jeor's sex term. "Prefer not to say" uses the midpoint.
const SEX_ADJUSTMENT: Record<Sex, number> = { male: 5, female: -161, unspecified: -78 };

const roundTo = (value: number, step: number) => Math.round(value / step) * step;

/**
 * Resting burn (Mifflin-St Jeor) × activity level = maintenance calories,
 * then ± the goal's change, rounded to 10 and kept between 1,200 and 6,000.
 * Protein is grams per kg of body weight for the goal, rounded to 5.
 */
export function computeTargets(answers: TargetAnswers): Targets {
  const resting =
    10 * answers.weightKg + 6.25 * answers.heightCm - 5 * answers.age + SEX_ADJUSTMENT[answers.sex];
  const maintenance = resting * ACTIVITY_LEVELS[answers.activity].multiplier;
  const goal = GOALS[answers.goal];
  const calories = Math.min(CALORIE_CEILING, Math.max(CALORIE_FLOOR, roundTo(maintenance + goal.calorieChange, 10)));
  return {
    restingCalories: Math.round(resting),
    maintenanceCalories: roundTo(maintenance, 10),
    calories,
    proteinG: roundTo(answers.weightKg * goal.proteinPerKg, 5),
  };
}

export type TargetField = "sex" | "age" | "height" | "weight" | "activity" | "goal";
export type TargetFormValues = Record<"sex" | "age" | "heightFt" | "heightIn" | "weight" | "activity" | "goal", string>;
export type TargetParseResult =
  | { ok: true; answers: TargetAnswers }
  | { ok: false; fieldErrors: Partial<Record<TargetField, string>> };

const LB_TO_KG = 0.45359237;
const IN_TO_CM = 2.54;

/** Checks the form (US units: feet, inches, pounds) and converts it to metric. */
export function parseTargetAnswers(values: TargetFormValues): TargetParseResult {
  const fieldErrors: Partial<Record<TargetField, string>> = {};
  const num = (raw: string) => (raw.trim() === "" ? NaN : Number(raw));

  if (!(values.sex in SEXES)) fieldErrors.sex = "Pick one. The calorie formula uses it.";

  const age = num(values.age);
  if (!Number.isFinite(age)) fieldErrors.age = "Enter your age.";
  else if (age < 18) fieldErrors.age = "This calculator is for adults, 18 and over.";
  else if (age > 100) fieldErrors.age = "Enter an age of 100 or under.";

  const feet = num(values.heightFt);
  const inches = values.heightIn.trim() === "" ? 0 : Number(values.heightIn);
  const heightCm = (feet * 12 + inches) * IN_TO_CM;
  if (!Number.isFinite(feet) || !Number.isFinite(inches) || inches < 0 || inches >= 12) {
    fieldErrors.height = "Enter your height in feet and inches.";
  } else if (heightCm < 120 || heightCm > 230) {
    fieldErrors.height = "Double-check your height.";
  }

  const pounds = num(values.weight);
  if (!Number.isFinite(pounds)) fieldErrors.weight = "Enter your weight in pounds.";
  else if (pounds < 70 || pounds > 700) fieldErrors.weight = "Double-check your weight.";

  if (!(values.activity in ACTIVITY_LEVELS)) fieldErrors.activity = "Pick how active you are.";
  if (!(values.goal in GOALS)) fieldErrors.goal = "Pick a goal.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return {
    ok: true,
    answers: {
      sex: values.sex as Sex,
      age: Math.round(age),
      heightCm,
      weightKg: pounds * LB_TO_KG,
      activity: values.activity as ActivityLevel,
      goal: values.goal as Goal,
    },
  };
}
