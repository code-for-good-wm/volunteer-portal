# AGENTS.md

Instructions for AI agents working in this repository. See `CLAUDE.md` for project overview, commands, and architecture.

## Keep `server/API_ENDPOINTS.md` up to date

Any agent that modifies the project's APIs must update `server/API_ENDPOINTS.md` in the same change, so the document always matches the code.

"Modifies the APIs" means any change under `server/` that affects what an endpoint exposes or does, including:

- adding, removing, or renaming an endpoint (a new or changed `function.json` route or `methods`)
- changing a request body, query parameter, or response shape
- changing who may call an endpoint (permission checks, `UserRole` lists)
- changing status codes, validation, or other observable behavior in a handler (`server/*/index.ts`)
- changing a `lib/models/store.ts` method in a way that alters what an endpoint returns

When you do, update `server/API_ENDPOINTS.md`:

- Follow the existing format: add or edit rows in the relevant section's `Method | Route | Who | Status | Notes` table, and keep the Summary table and the "Client coverage" lists in step.
- Document routes without the `/api` prefix, as the file already does.
- Describe request and response bodies and error codes in the Notes column, or in a sub-section with a JSON example for endpoints that need more room (see section 7, Team selection).
- Remove or correct entries for endpoints you delete or change. Don't leave stale rows.
- Don't mark an endpoint as verified (✅) beyond what you actually ran. Say how it was checked, as the "How this was verified" section does.

If a change doesn't touch the APIs (client-only work, tests, tooling), the document doesn't need updating.
