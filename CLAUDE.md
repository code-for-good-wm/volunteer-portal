# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Code for Good Volunteer Portal — a full-stack app deployed as an Azure Static Web App. React/TypeScript SPA frontend, Azure Functions (Node/TypeScript) API backend, MongoDB (CosmosDB Mongo API) via Mongoose, Firebase for authentication.

This is **not** an npm-workspaces monorepo. There are three independent `package.json` files (root, `client/`, `server/`) wired together only by shell scripts that `cd` into each subfolder and run `npm install`/`npm run build`.

## Commands

Full local dev (from repo root):

```bash
npm run dev:install   # builds client and server
npm run dev           # serves both via Azure Static Web Apps CLI on port 3000
npm test              # runs the client tests, then the server tests
```

Client only (`cd client`):

- `npm run start` — Vite dev server
- `npm run build` — `tsc && vite build`
- `npm run serve` — preview a production build
- `npm run lint` — ESLint
- `npm test` — Vitest suite (`npm run test:watch`, `npm run test:coverage`)

Server only (`cd server`):

- `npm run build` — `tsc`
- `npm run watch` — `tsc` in watch mode
- `npm run start` — builds then runs `func start` (requires Azure Functions Core Tools v4 installed locally, e.g. `brew tap azure/functions && brew install azure-functions-core-tools@4`)
- `npm test` — Vitest suite
- No `lint` script is defined; run `eslint` directly if needed.

Tests: `cd server && npm test` runs the server's Vitest suite (`*.test.ts`), using `mongodb-memory-server` for an in-memory MongoDB (helpers in `server/lib/test-utils/`). `npm run test:watch` and `npm run test:coverage` are also available. `cd client && npm test` runs the client's Vitest suite (`src/**/*.test.{ts,tsx}`) in jsdom with React Testing Library and jest-dom matchers (setup in `client/src/setupTests.ts`, config in `client/vitest.config.mts`, which pins the time zone to America/Detroit and the locale to en-US so date assertions are stable). Both packages use Vitest with globals off, so import `describe`/`it`/`expect` from `vitest`. When adding new functionality, add tests for it. GitHub Actions (`.github/workflows/pr-checks.yml`) builds and tests both the client and the server on PRs to `dev` and `main`.

### Local environment setup

1. `client/env.example` → `client/.env` (or `.env.local`) — Vite env vars for MSAL, Firebase config, `VITE_AZURE_CLOUD_FUNCTION_BASE_URL`, SendGrid template ID.
2. `server/local.settings.example.json` → `server/local.settings.json` — includes `DATABASE_URI`/`DATABASE_PASS`/`DATABASE_NAME`, `SENDGRID_API_KEY`, `GOOGLE_APPLICATION_CREDENTIALS`.
3. Database: the preferred setup is the shared dev Cosmos DB (MongoDB API, account `volunteer-portal-dev`). The example `DATABASE_URI` already points at it with a `__DB_PASS__` placeholder, which `server/lib/config/index.ts` replaces with `DATABASE_PASS`. This database is shared with the whole team, so never run destructive operations or one-off scripts against it without asking. A local MongoDB (`mongodb://localhost:27017`) is an optional fallback for offline work.
4. A Firebase service-account JSON (conventionally `fb-credentials.dev.json`, gitignored) is required for the server; its path goes in `GOOGLE_APPLICATION_CREDENTIALS`.

Node version: root, `client`, and `server` all require Node >=22 (`engines` field), matching the `node:22` `apiRuntime` in `staticwebapp.config.azure.json`/`staticwebapp.config.json` and the `azure-pipelines.yml` `NodeTool@0` version. Azure Static Web Apps' managed Functions API currently supports up to Node 22 — Node 24 is not yet available for this deployment model (only for standalone Azure Functions on Flex Consumption), so don't bump past 22 without first migrating off SWA-managed Functions.

## Architecture

### Backend (`server/`)

Azure Functions, one folder per resource (`event/`, `events/`, `profile/`, `profiles/`, `program/`, `programs/`, `user/`, `users/`, `settings/`, `skills/`, `skill-options/`, `event-attendance/`, `event-attendances/`, `email/`, `export/`, `team-selection-slots/`, `team-selection-slot/`, `team-selection-attendees/`). Each folder contains `function.json` (route/HTTP binding config) and `index.ts` (the handler, exported as the default `httpTrigger`). The folder name _is_ the route — there is no single server entry point; each resource folder is an independent entry point.

Shared backend code lives in `server/lib/`:

- `models/*.ts` — Mongoose schemas (`user.ts`, `profile.ts`, `event.ts`, `program.ts`, `event-attendance.ts`, `user-skill.ts`, `skill-options.ts`); enums under `models/enums/` (e.g. `user-role.enum.ts`).
- `models/store.ts` — the data-access layer. All handlers go through store objects (`userStore`, `eventStore`, etc.) rather than calling Mongoose directly; this is the pattern to follow for any new data access. Also owns the Mongoose `connect()`.
- `core.ts` — shared HTTP response envelope: `IHttpResult`, `createSuccessResult`, `createErrorResult`.
- `helpers.ts` — `checkRequestAuth` (verifies the Firebase ID token via `firebase-admin`) and `checkAuthAndConnect` (auth check + DB connect combined); nearly every handler calls this first.

Authorization is role-based via the `UserRole` enum, checked inline in handlers (e.g. `READ_ALL_EVENTS.includes(user.userRole)` in `server/events/index.ts`) rather than through middleware.

There are no formal DB migrations — Mongo is schemaless and schema changes happen via the Mongoose model files directly.

### Frontend (`client/`)

Vite + React 18 + TypeScript SPA, MUI 5 for components, Redux Toolkit for state, React Router 6 for navigation.

Structure mirrors the backend's resources:

- `src/services/*.ts` — one file per domain, calls the API (via `helpers/functions.ts`'s `getApiBaseUrl()`) with a Firebase bearer token, dispatches results into Redux.
- `src/store/` — Redux Toolkit slice per domain, populated by the matching service.
- `src/views` — pages; `src/components` — shared UI; `src/nav` — route guards / `NavSwitch` for public vs. private routing; `src/material` — MUI theme; `src/firebase` — Firebase client init and ID token retrieval (`src/services/auth.ts`).

Note: MSAL/Azure AD packages (`@azure/msal-browser`, `@azure/msal-react`) and `authConfig.ts` are also present in the client and referenced in CI env vars, alongside the live Firebase auth path — confirm with the team whether this is an active parallel auth path or legacy before relying on it.

### Deployment

`azure-pipelines.yml` (Azure DevOps, not GitHub Actions) builds the client with Vite, copies `staticwebapp.config.azure.json`, pulls a secure Firebase service-account file, and deploys client + Functions API together via the `AzureStaticWebApp@0` task. No Dockerfile — deployment is native Azure Static Web Apps, not containerized.
