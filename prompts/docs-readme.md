# Prompt log: README

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The brief asks for a README that "lets someone else understand and run your app: what it does, the live URL, the tools you used, and how to run it." It also says I must understand "how the app is structured to accept and store data, and how users interact with the app."

## What the agent wrote

- What Prepped does, plus a feature table showing where each feature lives
- **How it works:** a small diagram and four plain-English points covering how data comes in (server actions + validation), how it's stored (5 tables + database rules), how it stays private (every query filters on `user_id`), and what's calculated instead of stored
- The tools and what each is for
- How to run it locally (PGlite, no database setup needed), the tests, and how deploys apply migrations

## Open item

The live URL is filled in once the Neon database is connected and the first production deploy succeeds.
