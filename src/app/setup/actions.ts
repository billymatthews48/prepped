"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { setTargets } from "@/lib/goal";
import { requireUser } from "@/lib/session";
import { computeTargets, parseTargetAnswers, type TargetField, type TargetFormValues } from "@/lib/targets";
import { today } from "@/lib/today";

export type TargetsFormState = { fieldErrors?: Partial<Record<TargetField, string>> };

/**
 * Checks the answers, works the targets out again on the server (never trusts
 * numbers sent from the page), saves them for the signed-in user, and goes
 * to Today.
 */
export async function saveTargetsAction(_prev: TargetsFormState, formData: FormData): Promise<TargetsFormState> {
  const user = await requireUser();
  const field = (name: keyof TargetFormValues) => String(formData.get(name) ?? "");
  const parsed = parseTargetAnswers(
    {
      units: field("units"),
      sex: field("sex"),
      dob: field("dob"),
      heightFt: field("heightFt"),
      heightIn: field("heightIn"),
      heightCm: field("heightCm"),
      weight: field("weight"),
      activity: field("activity"),
      goal: field("goal"),
    },
    await today(),
  );
  if (!parsed.ok) return { fieldErrors: parsed.fieldErrors };

  const { calories, proteinG } = computeTargets(parsed.answers);
  await setTargets(user.id, { calories, proteinG });
  revalidatePath("/today");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  redirect("/today");
}
