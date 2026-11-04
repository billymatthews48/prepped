# Prompt log: README

Agent: Claude Code (desktop app). Tue Nov 3, 2026.

## Prompt

Continuing "backwards induct from those outcomes and get started." The brief asks for a README that "lets someone else understand and run your app: what it does, the live URL, the tools you used, and how to run it." It also says I must understand "how the app is structured to accept and store data, and how users interact with the app."

## What the agent wrote

- What Prepped does, plus a feature table showing where each feature lives
- **How it works:** a small diagram and four plain-English points covering how data comes in (server actions + validation), how it's stored (5 tables + database rules), how it stays private (every query filters on `user_id`), and what's calculated instead of stored
- The tools and what each is for
- How to run it locally (PGlite, no database setup needed), the tests, and how deploys apply migrations

## Live URL

**Me:** "i think its done" (after accepting Neon's terms in Vercel)

The agent connected the Neon database and redeployed. The build log showed "Production database migrated." and the app went live at **https://prepped-beta.vercel.app**.

## Mistake the agent made

The agent ran "fill in the URL → commit → open PR → merge" as one chain. The text-replacement step failed on a `#` character, so nothing was committed, but the PR was still opened and merged (PR #30) with the placeholder in the README. The agent caught it right after by checking the PR, and fixed it in a follow-up PR (#32). Lesson: check each step succeeded before merging.
