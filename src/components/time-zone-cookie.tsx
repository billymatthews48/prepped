"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { TIME_ZONE_COOKIE } from "@/lib/dates";

/** Tells the server the browser's time zone, so "today" matches the user's clock. */
export function TimeZoneCookie() {
  const router = useRouter();
  useEffect(() => {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = document.cookie
      .split("; ")
      .find((part) => part.startsWith(`${TIME_ZONE_COOKIE}=`))
      ?.split("=")[1];
    if (timeZone && decodeURIComponent(current ?? "") !== timeZone) {
      document.cookie = `${TIME_ZONE_COOKIE}=${encodeURIComponent(timeZone)}; path=/; max-age=31536000; samesite=lax`;
      router.refresh();
    }
  }, [router]);
  return null;
}
