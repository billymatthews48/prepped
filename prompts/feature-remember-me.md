# Prompt log: Remember me

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

**Me:** "let's add a "remember me" option in log in at autopopulates username and password (using a secure method obvs)"

**Agent (excerpt):** "I won't store your password anywhere. Saving passwords is your browser's job, so I'll make the login form work properly with its password manager. The checkbox will keep you signed in and pre-fill your email next time."

## What the agent built

- **"Remember me" checkbox** on the login page, ticked by default (the same as before, when logins always lasted).
  - **Ticked:** the login cookie lasts after the browser closes, and my **email is filled in** on the login page next time, with the cursor already in the password box.
  - **Unticked:** the login ends when the browser closes, and any remembered email is forgotten (for a shared computer).
- **Password: filled by the browser, never by the app.** The fields now carry `autocomplete="username"` and `current-password` / `new-password`, the markup that Chrome, Safari and 1Password use to offer saving and filling. The app never stores a password anywhere it could leak. Better Auth only keeps a hash.
- **The remembered email** is in an `httpOnly` cookie (page scripts can't read it), sent only to this site, for one year (`src/lib/remember.ts`).
- `src/lib/remember-me.test.ts`: 2 checks. Remember me on gives a login cookie with a lifetime (`Max-Age`), and off gives one that ends with the browser. 51 tests total.

## Why not store the password?

Anything that can put a password back into the box can also leak it: a cookie, local storage, or the database in a readable form. Browsers and password managers keep passwords encrypted, tied to this site, and behind the device's lock. Doing it in the app would be strictly worse.

## Checked in the browser (local)

- Login page: email `autocomplete=username`, password `current-password`, Remember me ticked
- Logged in with it ticked → logged out → login page had the email filled in, the cursor in Password, and the password box empty (left for the browser to fill)
- The cookie isn't visible to page scripts (`document.cookie` doesn't include it)
- Logged in with it unticked → logged out → email box empty
- Typecheck, lint and 51 tests pass
