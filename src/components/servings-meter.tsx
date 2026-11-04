/** "3 of 5 left" with a small bar. */
export function ServingsMeter({ left, made }: { left: number; made: number }) {
  const percent = Math.round((left / made) * 100);
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1">
      <p className="text-sm tabular-nums">
        <span className="font-semibold">{left}</span>
        <span className="text-muted"> of {made} left</span>
      </p>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-background" aria-hidden>
        <div
          className={`h-full rounded-full ${left === 0 ? "bg-border" : "bg-accent"}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
