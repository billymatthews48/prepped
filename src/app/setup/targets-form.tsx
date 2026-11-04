"use client";

import { startTransition, useActionState, useState } from "react";
import { Button, Field } from "@/components/ui";
import { formatCalories } from "@/lib/format";
import {
  ACTIVITY_LEVELS,
  CALORIE_FLOOR,
  GOALS,
  SEXES,
  UNITS,
  computeTargets,
  parseTargetAnswers,
  type TargetField,
  type TargetFormValues,
  type Units,
} from "@/lib/targets";
import { saveTargetsAction } from "./actions";

const selectClass =
  "rounded-xl border bg-surface px-3 py-2.5 text-base outline-none focus:border-accent focus:ring-2 focus:ring-accent-soft";

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: Record<string, string>;
  error?: string;
}) {
  const id = `field-${name}`;
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        className={`${selectClass} ${error ? "border-danger" : "border-border"}`}
      >
        <option value="" disabled>
          Choose…
        </option>
        {Object.entries(options).map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}

const labels = <T extends Record<string, { label: string }>>(items: T) =>
  Object.fromEntries(Object.entries(items).map(([key, item]) => [key, item.label]));

const LB_PER_KG = 2.20462;
const round1 = (n: number) => String(Math.round(n * 10) / 10);

/** Converts whatever height and weight are typed in when the units switch. */
function convertUnits(values: TargetFormValues, to: Units): TargetFormValues {
  const num = (raw: string) => (raw.trim() === "" ? NaN : Number(raw));
  if (to === "metric") {
    const inches = num(values.heightFt) * 12 + (num(values.heightIn) || 0);
    const pounds = num(values.weight);
    return {
      ...values,
      units: to,
      heightCm: Number.isFinite(inches) ? String(Math.round(inches * 2.54)) : values.heightCm,
      weight: Number.isFinite(pounds) ? round1(pounds / LB_PER_KG) : values.weight,
    };
  }
  const totalInches = Math.round(num(values.heightCm) / 2.54);
  const kg = num(values.weight);
  return {
    ...values,
    units: to,
    heightFt: Number.isFinite(totalInches) ? String(Math.floor(totalInches / 12)) : values.heightFt,
    heightIn: Number.isFinite(totalInches) ? String(totalInches % 12) : values.heightIn,
    weight: Number.isFinite(kg) ? String(Math.round(kg * LB_PER_KG)) : values.weight,
  };
}

/**
 * The questionnaire. Targets are worked out live in the browser as you
 * answer; the server works them out again from the same answers when you save.
 * `today` comes from the server (the user's time zone) so age matches on both.
 */
export function TargetsForm({ today }: { today: string }) {
  const [state, formAction, pending] = useActionState(saveTargetsAction, {});
  const [values, setValues] = useState<TargetFormValues>({
    units: "imperial",
    sex: "",
    dob: "",
    heightFt: "",
    heightIn: "",
    heightCm: "",
    weight: "",
    activity: "",
    goal: "",
  });
  const set = (name: keyof TargetFormValues) => (value: string) => setValues((v) => ({ ...v, [name]: value }));
  const metric = values.units === "metric";

  const parsed = parseTargetAnswers(values, today);
  const targets = parsed.ok ? computeTargets(parsed.answers) : null;
  const change = parsed.ok ? GOALS[parsed.answers.goal].calorieChange : 0;
  // Show a message from the last save only while that answer is still wrong,
  // so each one clears as soon as it's fixed.
  const stillWrong = parsed.ok ? {} : parsed.fieldErrors;
  const errors = Object.fromEntries(
    Object.entries(state.fieldErrors ?? {}).filter(([field]) => field in stillWrong),
  ) as Partial<Record<TargetField, string>>;

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => formAction(data));
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <input type="hidden" name="units" value={values.units} />
      <div role="radiogroup" aria-label="Units" className="grid grid-cols-2 gap-1 rounded-xl bg-background p-1">
        {(Object.keys(UNITS) as Units[]).map((units) => (
          <button
            key={units}
            type="button"
            role="radio"
            aria-checked={values.units === units}
            onClick={() => setValues((v) => (v.units === units ? v : convertUnits(v, units)))}
            className={`rounded-lg px-2 py-2 text-sm font-medium transition-colors ${
              values.units === units ? "bg-surface text-foreground shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            {UNITS[units]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field
          label="Date of birth"
          name="dob"
          type="date"
          max={today}
          value={values.dob}
          onChange={(e) => set("dob")(e.target.value)}
          error={errors.dob}
        />
        <SelectField
          label="Sex"
          name="sex"
          value={values.sex}
          onChange={set("sex")}
          options={SEXES}
          error={errors.sex}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        {metric ? (
          <Field
            label="Height (cm)"
            name="heightCm"
            type="number"
            inputMode="numeric"
            value={values.heightCm}
            onChange={(e) => set("heightCm")(e.target.value)}
          />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Height (ft)"
              name="heightFt"
              type="number"
              inputMode="numeric"
              value={values.heightFt}
              onChange={(e) => set("heightFt")(e.target.value)}
            />
            <Field
              label="Height (in)"
              name="heightIn"
              type="number"
              inputMode="numeric"
              value={values.heightIn}
              onChange={(e) => set("heightIn")(e.target.value)}
            />
          </div>
        )}
        {errors.height && <p className="text-sm text-danger">{errors.height}</p>}
      </div>

      <Field
        label={metric ? "Weight (kg)" : "Weight (lb)"}
        name="weight"
        type="number"
        inputMode="decimal"
        value={values.weight}
        onChange={(e) => set("weight")(e.target.value)}
        error={errors.weight}
      />

      <SelectField
        label="How active are you?"
        name="activity"
        value={values.activity}
        onChange={set("activity")}
        options={labels(ACTIVITY_LEVELS)}
        error={errors.activity}
      />

      <SelectField
        label="What's your goal?"
        name="goal"
        value={values.goal}
        onChange={set("goal")}
        options={labels(GOALS)}
        error={errors.goal}
      />

      <div aria-live="polite" className="rounded-xl bg-background p-4">
        {targets ? (
          <>
            <p className="text-sm text-muted">Your daily targets</p>
            <p className="text-2xl font-bold tabular-nums">
              {formatCalories(targets.calories)} cal · {targets.proteinG} g protein
            </p>
            <p className="mt-1 text-xs text-muted">
              You burn about {formatCalories(targets.restingCalories)} cal at rest, so about{" "}
              {formatCalories(targets.maintenanceCalories)} a day at your activity level.
              {change !== 0 && ` Your goal adjusts that by ${change > 0 ? "+" : "−"}${Math.abs(change)}.`}
              {targets.calories === CALORIE_FLOOR && ` Prepped never suggests less than ${formatCalories(CALORIE_FLOOR)}.`}
            </p>
          </>
        ) : (
          <p className="text-sm text-muted">Answer every question to see your targets.</p>
        )}
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Use these targets"}
      </Button>
      <p className="text-xs text-muted">
        Estimates from the Mifflin-St Jeor formula. They aren&apos;t medical advice.
      </p>
    </form>
  );
}
