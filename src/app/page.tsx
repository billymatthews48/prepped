import { redirect } from "next/navigation";
import { ButtonLink } from "@/components/ui";
import { getUser } from "@/lib/session";

export default async function Home() {
  if (await getUser()) redirect("/today");

  return (
    <section className="flex flex-col gap-5 py-10">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Meal prep, counted.
      </h1>
      <p className="max-w-prose text-lg text-muted">
        Prepped tracks the meals you actually cook: log a serving in one tap,
        see calories and protein against your goal, and know what&apos;s left in
        the fridge.
      </p>
      <div className="flex gap-3">
        <ButtonLink href="/signup">Get started</ButtonLink>
        <ButtonLink href="/login" variant="secondary">
          Log in
        </ButtonLink>
      </div>
    </section>
  );
}
