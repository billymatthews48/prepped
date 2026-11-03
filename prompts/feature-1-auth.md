# Prompt log: Feature 1, sign up and login

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

**Me:** "so can you backwards induct from those outcomes and get started?" The agent works through PLAN.md features in order. This one is the user story from Issue #5:

> As a new visitor, I want to create an account with my email and a password, then log in and log out, so that my meals and logs are private to me.

## What the agent built

- **Better Auth** (email + password) wired to my own database with Drizzle. `usePlural: true` makes the account table literally `users`, matching PLAN.md.
- Tables: `users` (one row per account), plus Better Auth's bookkeeping tables `sessions`, `accounts` (holds the hashed password), and `verifications`.
- `/signup` and `/login` pages, with server actions that show friendly errors ("That email and password don't match…", "An account with that email already exists…", "Your password needs at least 8 characters.").
- A Log out button in the header. `/today` is protected, so signed-out visitors are sent to `/login`.
- `scripts/migrate.mjs` applies database migrations: the local PGlite database before `npm run dev`, and Neon only on Vercel production builds.

## Checked in the browser (local)

1. Empty form → "Please enter your name / email" and the password-length message
2. Sign up as a test user → lands on "Hi, Ada"
3. Log out → back to the home page. Visiting `/today` → redirected to `/login`
4. Wrong password → "That email and password don't match. Check them and try again."
5. Correct password → back on `/today`

## Decisions the agent made

- **Server actions instead of a browser-side login library.** The forms post to the server, which signs in and sets the cookie. Less code in the browser, and the error messages are in my words, not the library's.
- **Password minimum of 8 characters.** Not specified in PLAN.md.
