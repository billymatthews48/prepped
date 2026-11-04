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

export const UNITS = {
  imperial: "Imperial (ft, in, lb)",
  metric: "Metric (cm, kg)",
} as const;
export type Units = keyof typeof UNITS;

export type TargetField = "sex" | "dob" | "height" | "weight" | "activity" | "goal";
export type TargetFormValues = Record<
  "units" | "sex" | "dob" | "heightFt" | "heightIn" | "heightCm" | "weight" | "activity" | "goal",
  string
>;
export type TargetParseResult =
  | { ok: true; answers: TargetAnswers }
  | { ok: false; fieldErrors: Partial<Record<TargetField, string>> };

const LB_TO_KG = 0.45359237;
const IN_TO_CM = 2.54;
const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Whole years between a date of birth and today ("YYYY-MM-DD" strings).
 * If this year's birthday hasn't happened yet, that's one year fewer.
 */
export function ageOn(dob: string, today: string): number {
  const [by, bm, bd] = dob.split("-").map(Number);
  const [ty, tm, td] = today.split("-").map(Number);
  const birthdayPassed = tm > bm || (tm === bm && td >= bd);
  return ty - by - (birthdayPassed ? 0 : 1);
}

function isRealDay(value: string): boolean {
  if (!ISO_DAY.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.valueOf()) && date.toISOString().slice(0, 10) === value;
}

/**
 * Checks the form and converts it to metric. Height and weight are read in
 * the units picked (imperial: feet + inches and pounds; metric: cm and kg),
 * and age comes from the date of birth as of `today` in the user's time zone.
 */
export function parseTargetAnswers(values: TargetFormValues, today: string): TargetParseResult {
  const fieldErrors: Partial<Record<TargetField, string>> = {};
  const num = (raw: string) => (raw.trim() === "" ? NaN : Number(raw));
  const metric = values.units === "metric";

  if (!(values.sex in SEXES)) fieldErrors.sex = "Pick one. The calorie formula uses it.";

  let age = NaN;
  if (!isRealDay(values.dob)) fieldErrors.dob = "Enter your date of birth.";
  else if (values.dob > today) fieldErrors.dob = "That date is in the future.";
  else {
    age = ageOn(values.dob, today);
    if (age < 18) fieldErrors.dob = "This calculator is for adults, 18 and over.";
    else if (age > 100) fieldErrors.dob = "Double-check your date of birth.";
  }

  let heightCm = NaN;
  if (metric) {
    heightCm = num(values.heightCm);
    if (!Number.isFinite(heightCm)) fieldErrors.height = "Enter your height in centimetres.";
  } else {
    const feet = num(values.heightFt);
    const inches = values.heightIn.trim() === "" ? 0 : Number(values.heightIn);
    heightCm = (feet * 12 + inches) * IN_TO_CM;
    if (!Number.isFinite(feet) || !Number.isFinite(inches) || inches < 0 || inches >= 12) {
      fieldErrors.height = "Enter your height in feet and inches.";
    }
  }
  if (!fieldErrors.height && (heightCm < 120 || heightCm > 230)) fieldErrors.height = "Double-check your height.";

  const rawWeight = num(values.weight);
  const weightKg = metric ? rawWeight : rawWeight * LB_TO_KG;
  if (!Number.isFinite(rawWeight)) fieldErrors.weight = `Enter your weight in ${metric ? "kilograms" : "pounds"}.`;
  else if (weightKg < 30 || weightKg > 320) fieldErrors.weight = "Double-check your weight.";

  if (!(values.activity in ACTIVITY_LEVELS)) fieldErrors.activity = "Pick how active you are.";
  if (!(values.goal in GOALS)) fieldErrors.goal = "Pick a goal.";

  if (Object.keys(fieldErrors).length > 0) return { ok: false, fieldErrors };
  return {
    ok: true,
    answers: {
      sex: values.sex as Sex,
      age,
      heightCm,
      weightKg,
      activity: values.activity as ActivityLevel,
      goal: values.goal as Goal,
    },
  };
}
