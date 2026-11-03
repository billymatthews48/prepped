import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_TIME_ZONE, TIME_ZONE_COOKIE, todayIn } from "./dates";

/** Today in the visitor's own time zone (set by <TimeZoneCookie />). */
export async function today(): Promise<string> {
  const timeZone = (await cookies()).get(TIME_ZONE_COOKIE)?.value ?? DEFAULT_TIME_ZONE;
  return todayIn(timeZone);
}
