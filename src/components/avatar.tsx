/** A circle with the first letter of the name, like an account picture. */
export function Avatar({ name, size = "sm" }: { name: string; size?: "sm" | "lg" }) {
  const initial = name.trim().charAt(0).toUpperCase() || "?";
  const sizes = size === "lg" ? "h-16 w-16 text-2xl" : "h-8 w-8 text-sm";
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-accent font-bold text-white ${sizes}`}
    >
      {initial}
    </span>
  );
}
