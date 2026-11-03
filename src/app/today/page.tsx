import type { Metadata } from "next";
import { Card, PageHeader } from "@/components/ui";
import { requireUser } from "@/lib/session";

export const metadata: Metadata = { title: "Today · Prepped" };

export default async function TodayPage() {
  const user = await requireUser();
  const firstName = user.name.split(" ")[0];

  return (
    <>
      <PageHeader title={`Hi, ${firstName}`} />
      <Card>
        <p className="text-muted">You&apos;re signed in. Your daily log will live here.</p>
      </Card>
    </>
  );
}
