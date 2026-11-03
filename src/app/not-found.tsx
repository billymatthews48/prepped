import { ButtonLink, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <Card className="mx-auto max-w-sm text-center">
      <p className="mb-1 text-lg font-bold">Not found</p>
      <p className="mb-5 text-sm text-muted">
        That page doesn&apos;t exist, or it belongs to someone else&apos;s account.
      </p>
      <ButtonLink href="/meals">Back to my meals</ButtonLink>
    </Card>
  );
}
