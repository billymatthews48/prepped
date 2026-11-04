"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/today", label: "Today" },
  { href: "/meals", label: "Meals" },
  { href: "/fridge", label: "Fridge" },
  { href: "/starred", label: "★ Starred" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    // Phones: five equal columns so every tab is visible. Wider screens: a row.
    <nav className="grid grid-cols-5 gap-1 sm:flex sm:items-center">
      {LINKS.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`whitespace-nowrap rounded-lg px-1 py-1.5 text-center text-xs font-medium transition-colors sm:px-3 sm:text-sm ${
              active ? "bg-accent-soft text-accent-strong" : "text-muted hover:text-foreground"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
