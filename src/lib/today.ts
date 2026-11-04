import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_TIME_ZONE, TIME_ZONE_COOKIE, todayIn } from "./dates";

/** The visitor's own time zone (set by <TimeZoneCookie />). */
export async function visitorTimeZone(): Promise<string> {
  return (await cookies()).get(TIME_ZONE_COOKIE)?.value ?? DEFAULT_TIME_ZONE;
}

/** Today in the visitor's own time zone. */
export async function today(): Promise<string> {
  return todayIn(await visitorTimeZone());
}
