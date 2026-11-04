# Prompt log: Greeting + profile page

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

**Me:** "also can we add some sort of "Hello, Billy" in the home page or smth like claude has? idk, make the profile a bit more prominent vs hidden in the corner"

## What the agent built

- **Greeting on Today**: "Good morning / afternoon / evening, Billy", based on the hour **in my own time zone** (the same cookie that decides "today"). Under it is a one-line summary of the day: "750 cal and 60 g of protein left today.", "90 cal over your goal, with 24 g of protein still to go." or "Nothing logged yet today. What did you eat first?" It only shows on today, not when looking back at a past day.
- **Header**: my initial in a green circle plus my first name, **on phones too** (the name used to be hidden on phones). It links to my profile.
- **`/profile`**: name, email, "Member since…", my calorie and protein goals with Set/Redo targets, a few numbers (meals saved, starred, current and best streak), and Log out.
- `src/lib/greeting.ts` holds the greeting logic as pure functions, and `src/lib/greeting.test.ts` has 4 checks (time zone, time-of-day cut-offs, first name, the day summary). 49 tests total.

## Decisions the agent made (worth owning)

- **Cut-offs:** morning 5am–noon, afternoon noon–5pm, evening otherwise (late night counts as evening).
- **First name only**: the first word of the account name, or "there" if it's blank.
- **Log out stays in the header** as well as on the profile page, so it's still easy to find.
- **Initial, not a photo.** Photo upload would need file storage, which isn't worth it for this.

## Checked in the browser (local)

- Today: "Good evening, Ada" and "Nothing logged yet today…". The header shows "A Ada", linking to /profile
- /profile: email, "Member since Nov 3, 2026", goals 2,260 / 160 g with "Redo targets", the 4 stat tiles, Log out
- 375px: no sideways scrolling, and the name shows in the header. Typecheck, lint and 49 tests pass
