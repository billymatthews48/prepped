import type { Metadata } from "next";
import Link from "next/link";
import { Card } from "@/components/ui";
import { requireUser } from "@/lib/session";
import { TargetsForm } from "./targets-form";

export const metadata: Metadata = { title: "Set your targets · Prepped" };

export default async function SetupPage() {
  await requireUser();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Set your targets</h1>
        <p className="mt-1 text-sm text-muted">
          Six quick questions, and Prepped works out a daily calorie and protein goal for you. You can change
          them any time.
        </p>
      </div>
      <Card>
        <TargetsForm />
      </Card>
      <p className="text-center text-sm text-muted">
        <Link href="/today" className="font-medium text-accent hover:underline">
          Skip for now
        </Link>
        . Your goals stay as they are.
      </p>
    </div>
  );
}
