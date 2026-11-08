# Volunteer Portal API: Endpoint Inventory & Status

_Reviewed 2026-11-08 against the working tree (including the new `roles` and `default-skills` functions and the reworked `position` handler). The team-selection endpoints (section 7) were added afterwards._

All routes are Azure Functions served under **`/api`** (e.g. `GET /api/events`). Every endpoint except `GET /settings` requires a Firebase ID token in the **`x-firebase-auth: Bearer <token>`** header; without one it returns `401`. "Admin" below means `boardmember` or `admin` role.

## How this was verified

1. **Read every handler** (`server/*/index.ts`, `function.json`) and the data layer (`lib/models/store.ts`).
2. **Type-checked** the server (`tsc --noEmit`, both configs): clean.
3. **Ran the existing Vitest suite**: 56 handler/helper tests pass. `lib/models/store.test.ts` couldn't run in my sandbox because `mongodb-memory-server` couldn't download its MongoDB binary. It should still run in CI and locally.
4. **Ran a live smoke test.** I called all 25 handlers 117 times, covering happy paths, permission checks and bad input. They ran against a real Mongo-compatible database (FerretDB, a throwaway local instance, **not** the shared dev Cosmos DB). Firebase auth and SendGrid were mocked. Results are shown in the tables below.

The team-selection endpoints (section 7) were added after that review, so they weren't part of the live smoke test. They're covered by handler unit tests and by `store.test.ts` against an in-memory MongoDB.

**Legend:** ✅ works as intended · ⚠️ works, but with a bug or gap worth knowing · ❌ broken · 🚫 not built

---

## Summary

| Area | Endpoints | Status |
|---|---|---|
| Users / profiles / user skills | `/user`, `/users`, `/user/{id}/profile`, `/profiles`, `/user/{id}/skills` | ✅ mostly. One ⚠️: POST profile creates a duplicate |
| Skill catalog | `/user/skills/{code}` (skill-options), `/skills`, `/roles` | ❌ **PUT and DELETE skill option are broken**; GET is fine |
| Programs & events | `/program`, `/programs`, `/event`, `/events` | ✅. ⚠️ `programs?includeEvents` always returns empty events |
| Attendance | `/user/{id}/event-attendance`, `/event-attendances` | ✅ |
| Nonprofits & projects | `/nonprofit`, `/nonprofits`, `/project`, `/projects` | ✅. ⚠️ deletes don't cascade |
| Positions, position skills & slots | `/project/{id}/position`, `/position/{id}/skill`, `/position/{id}/slot`, `/user/{id}/slot` | ✅. ⚠️ deleting a single slot makes `slotCount` drift |
| Team selection | `/team-selection/{id}/slots`, `/team-selection/{id}/attendees`, `/team-selection/slots/{slotId}` | ✅ new. Unit-tested only (not in the live smoke test) |
| Utility | `/email`, `/export`, `/settings` | ⚠️ export is hard-coded to one event; **settings leaks env var names without auth** |

---

## 1. Users & profiles

| Method | Route | Who | Status | Notes |
|---|---|---|---|---|
| POST | `/user` | any signed-in | ✅ | Body `{ email }`. Creates the User (role `volunteer`) **and** an empty Profile. 400 if the user already exists. |
| GET | `/user` | self | ✅ | Returns the caller's own user. A `{userId}` in the path is **ignored**: `GET /user/{someoneElse}` still returns the caller. |
| PUT | `/user/{userId}` | self | ✅ | `userRole` in the body is ignored, so users can't promote themselves. ⚠️ Every other field is written as-is, including `ident`, `authProvider` and `email`. A client could overwrite `ident` and lock the account out. |
| DELETE | `/user/{userId}` | self | ✅ | Deletes user + profile + user skills. ⚠️ Leaves that user's event-attendance and slot records behind. |
| GET | `/users` | admin | ✅ | All users. 403 for volunteers. |
| GET | `/user/{userId}/profile` | self | ✅ | Profile with the user's skills merged into `skills`. |
| PUT | `/user/{userId}/profile` | self | ✅ | Updates profile fields. A `skills: [{code, level}]` array is upserted into the UserSkill collection. This is how the client saves skills. |
| POST | `/user/{userId}/profile` | self | ⚠️ | Doesn't check for an existing profile, so it **creates a second profile** (verified). `POST /user` already creates one, so the client never needs this. Add a guard or remove it. |
| DELETE | `/user/{userId}/profile` | self | ✅ | Deletes profile + skills. |
| GET | `/profiles` | admin | ✅ | All profiles with skills merged. |

### User skills: `/user/{userId}/skills/{skillCode?}` (self only; not called by the client)

| Method | Status | Notes |
|---|---|---|
| GET | ✅ | All skills, or filter by `{skillCode}`. |
| POST | ✅ | Single `{code, level}` or an array. |
| PUT | ⚠️ | Requires `_id`. The single-object form rejects `level: 0` because it checks `skills?.level` for truthiness. Returns `201` instead of `200`. |
| DELETE | ✅ | By body `_id`, by `{skillCode}`, or with neither it deletes **all** of the user's skills. |

## 2. Skill catalog & lookups

| Method | Route | Who | Status | Notes |
|---|---|---|---|---|
| GET | `/user/skills` | any signed-in | ✅ | Skill options from the DB, filterable by `?category=`. Falls back to the hard-coded defaults when the collection is empty. |
| GET | `/user/skills/{code}` | any signed-in | ✅ | Returns a one-element array. |
| POST | `/user/skills` | admin | ⚠️ | Works with `{code, description, category}`. Omitting `description` throws a Mongoose validation error, which surfaces as an unhandled **500**. The handler also sends `name` and `level`, but the schema has no such fields, so they're **silently dropped**. |
| PUT | `/user/skills/{code}` | admin | ❌ | **Always fails with 500.** The handler passes the skill *code* to `skillOptionsStore.update()`, which filters on `_id` (`CastError: Cast to ObjectId failed for value "go"`). The store needs to query by `code`. |
| DELETE | `/user/skills/{code}` | admin | ❌ | **Always fails with 500**, for the same reason as PUT. |
| GET | `/skills` | any signed-in | ✅ | _New._ Always returns the hard-coded `defaultSkillOptions` (ignores the DB). |
| GET | `/roles` | any signed-in | ✅ | _New._ Returns `["designer","developer","support","lead"]`. |

> Naming is confusing: `/skills` (defaults), `/user/skills` (catalog in the DB) and `/user/{id}/skills` (a person's skills) are three different things. Consider moving the catalog to `/skill-options` before more client code depends on it.

## 3. Programs & events

| Method | Route | Who | Status | Notes |
|---|---|---|---|---|
| GET | `/program/{programId}` | any signed-in | ✅ | |
| POST | `/program` | admin | ✅ | |
| PUT | `/program/{programId}` | admin | ⚠️ | Works, but returns the raw Mongo result (`{acknowledged, modifiedCount, ...}`) instead of the updated program. |
| DELETE | `/program/{programId}` | admin | ✅ | Leaves its events pointing at a deleted program. |
| GET | `/programs` | any signed-in | ✅ | |
| GET | `/programs?includeEvents=1` | any signed-in | ⚠️ | Populates `program.events`, but **nothing ever writes to that array**: creating an event sets `event.program` and never pushes onto `program.events`. In practice `events` is always `[]` (verified). Either maintain the array or query events by `program`. |
| GET | `/event/{eventId}` | any signed-in | ✅ | Program populated. |
| POST | `/event` | admin | ✅ | Required: `program, name, startDate, endDate, eventType, status`. Missing fields → unhandled **500** instead of 400. |
| PUT | `/event/{eventId}` | admin | ✅ | Returns the updated event. |
| DELETE | `/event/{eventId}` | admin | ✅ | Doesn't clean up attendance, or projects assigned to the event. |
| GET | `/events` | any signed-in | ✅ | Volunteer view: `upcoming` events, plus `active` events that haven't ended. |
| GET | `/events/all` | admin | ✅ | All events; 403 for volunteers. |

## 4. Event attendance (RSVP)

| Method | Route | Who | Status | Notes |
|---|---|---|---|---|
| GET | `/user/{userId}/event-attendance/{eventId?}` | self | ✅ | One record, or all of the user's records. |
| PUT | `/user/{userId}/event-attendance/{eventId}` | self | ✅ | **Upsert**: creates (201) or updates (200). This is what the client uses. |
| POST | `/user/{userId}/event-attendance/{eventId}` | self | ⚠️ | Works with an `eventId`. Without one it throws a **500** validation error. It doesn't check for an existing record, so it can create duplicates. PUT is the safer call. |
| DELETE | `/user/{userId}/event-attendance/{eventId}` | self | ✅ | |
| GET | `/event-attendances/{eventId?}` | admin | ✅ | All attendance, or attendance for one event. |

🚫 There's no way for an admin to edit **another** user's attendance, e.g. to set `allocation`, which looks like an organizer field.

## 5. Nonprofits & projects

| Method | Route | Who | Status | Notes |
|---|---|---|---|---|
| GET | `/nonprofit/{id}` | any signed-in | ✅ | Contact info and EIN are redacted for non-admins (verified). |
| POST | `/nonprofit` | admin | ✅ | `status` is forced to `interested`. |
| PUT | `/nonprofit/{id}` | admin | ✅ | |
| DELETE | `/nonprofit/{id}` | admin | ⚠️ | Works, but leaves that nonprofit's projects orphaned. |
| GET | `/nonprofits` | any signed-in | ✅ | Redacted for non-admins. |
| GET | `/project/{id}` | any signed-in | ✅ | ⚠️ Not redacted, so volunteers can read internal `notes`. |
| POST | `/project` | admin | ✅ | `status` is limited to `proposed` or `accepted`; `submittedAt` is set automatically. |
| PUT | `/project/{id}` | admin | ✅ | Used to accept or reject a project, or assign it to an event. |
| DELETE | `/project/{id}` | admin | ⚠️ | Leaves its positions, slots and position-skills orphaned. |
| GET | `/projects` `?nonprofitId=` `?eventId=` | any signed-in | ✅ | A malformed id → unhandled **500** (`BSONError`). |

## 6. Positions, position skills & slots

| Method | Route | Who | Status | Notes |
|---|---|---|---|---|
| GET | `/project/{projectId}/position/{positionId?}` | any signed-in | ✅ | |
| POST | `/project/{projectId}/position` | admin | ✅ | _Recently reworked._ Validates `role`, and `slotCount` from 1 to 100. Allows one position per role per project (409). Creates `slotCount` open slots. |
| PUT | `/project/{projectId}/position/{positionId}` | admin | ✅ | Adds or removes open slots to match `slotCount` (verified 2 → 4). Refuses to shrink below the number of filled or invited slots. |
| DELETE | `/project/{projectId}/position/{positionId}` | admin | ✅ | Removes the position's slots and skills. Returns 409 if anyone is invited or assigned. Note: a **declined** slot still has a `user`, so it also blocks deletion. |
| GET | `/position/{positionId}/skill/{code?}` | any signed-in | ✅ | Not used by the client yet. |
| POST | `/position/{positionId}/skill` | admin | ✅ | `{code, minimumLevel, importance}`. |
| PUT | `/position/{positionId}/skill` | admin | ✅ | Requires `_id` in the body. |
| DELETE | `/position/{positionId}/skill/{code?}` | admin | ✅ | By `{code}` or body `_id`. |
| GET | `/position/{positionId}/slot/{slotId?}` | admin | ✅ | ⚠️ The client's `getEventSlotCounts()` calls this, so it returns 403 for non-admins. Fine if only admins see that screen. |
| PUT | `/position/{positionId}/slot/{slotId}` | admin | ✅ | Invite or assign a volunteer: `{user, status}`. Enforces one confirmed slot per volunteer per event (409). Returns the raw Mongo update result, not the slot. |
| DELETE | `/position/{positionId}/slot/{slotId}` | admin | ⚠️ | **Doesn't decrement `position.slotCount`.** After deleting one slot, the position said 4 while only 3 slots existed (verified). Later shrink checks then compute the wrong minimum. Either decrement `slotCount` here or remove this route now that PUT position manages slots. |
| GET | `/user/{userId}/slot/{slotId?}` | self | ✅ | A volunteer's own slots. Returns raw slots (position id only, no project or event details). |
| PUT | `/user/{userId}/slot/{slotId}` | self | ✅ | Volunteer response: `confirmed` / `confirmed-partial` / `declined`. Only allowed from `invited`. Same 409 conflict rule. Not wired into the client yet. |

## 7. Team selection

Used by organizers to staff a project: list the project's slots by role, list the event's attendees, and assign (or release) a volunteer on a slot. All three are **admin only** (`boardmember` / `admin`; 403 otherwise).

| Method | Route | Who | Status | Notes |
|---|---|---|---|---|
| GET | `/team-selection/{projectId}/slots` | admin | ✅ | _New._ Every slot on the project's positions, assigned or not, **grouped by position role**: `{ "developer": [slot, ...], "designer": [...] }`. Each slot has `position` and `user` (`firstName`, `lastName`, `email`) populated; `user` is absent while the slot is open. Roles with no slots are omitted. 404 for an unknown project. |
| GET | `/team-selection/{projectId}/attendees` `?role=` | admin | ✅ | _New._ Attendees of the project's event, returned as `{ results, filter }` (see below). 404 for an unknown project; **400 if the project isn't assigned to an event**, or if `?role=` isn't a valid role. |
| PUT | `/team-selection/slots/{slotId}` | admin | ✅ | _New._ Assign a volunteer to a slot, or release the current one (see below). The project is derived from the slot (slot → position → project), so there's no `{projectId}` in the path. Returns the updated slot, with `position` and `user` populated, the same shape as the slots in the GET. |

### `GET /team-selection/{projectId}/attendees`

```jsonc
{
  "results": [
    { "_id": "<attendance id>", "user": { "_id": "<user id>", "firstName": "Ada", "lastName": "Lovelace", "email": "ada@example.com" },
      "attendance": "attending", "roles": ["developer", "designer"], "allocation": "unassigned",
      "assignedToSlot": false }
  ],
  "filter": { "projectId": "<from the url>", "eventId": "<the project's event>", "role": "designer" }   // role only when ?role= was given
}
```

- **`results`** is a flat list with **one entry per event-attendance record**, so an attendee with several roles appears once (with their full `roles` array). Anyone not marked `not-attending` is included. A user with two attendance records for the event appears twice, since the entries are unique by attendance `_id`, not by user.
- **`?role=developer`** keeps only records whose `roles` include that role (the record itself isn't trimmed). Without it, attendees with no roles are included too.
- **`assignedToSlot`** (boolean) is `true` when the user already holds a slot on **any project for the event**: `invited`, `confirmed` or `confirmed-partial`. `declined` and `open` slots don't count. Use it to hide or grey out people who are already placed.
- **`filter`** echoes what the list was built from: the URL's `projectId`, the `eventId` derived from the project, and the `role` only when it was passed.

### `PUT /team-selection/slots/{slotId}`

Body (JSON): `{ "userId": "<user _id>", "status": "invited" }`. `userId` is the **user's** `_id` (`attendee.user._id`), not the attendance `_id`.

| Body | Result |
|---|---|
| `{ "userId": "..." }` | Assigns the user and sets `status` to **`invited`** (the default), stamping `invitedAt`. |
| `{ "userId": "...", "status": "confirmed" }` | Assigns with that status. Valid: `invited`, `confirmed`, `confirmed-partial`, `declined`. `respondedAt` is stamped for the last three. |
| `{}` (no `userId`) | **Releases the slot**: removes its volunteer, returns it to `open` and clears `invitedAt`, `respondedAt`, `partialDetail` and `declineReason`. A no-op (still 200, slot returned unchanged) if nobody is assigned. `status` is ignored. |

Errors: `400` for a malformed `userId`, an unknown `status`, or `open` (an assigned slot can't be open); `404` for an unknown or malformed slot id, a slot whose project no longer exists, or an unknown volunteer; `409` when confirming (`confirmed` / `confirmed-partial`) a volunteer who already has a confirmed slot for the event, the same rule as `/position/{id}/slot`.

Reassigning a slot to a **different** volunteer clears the previous volunteer's `partialDetail` and `declineReason` and re-stamps `invitedAt`. Re-saving the **same** volunteer keeps them.

⚠️ It doesn't check that the user attended the event or that their roles match the position, only the one-confirmed-slot-per-event rule. And there's no `GET /team-selection/slots/{slotId}`: to re-read a slot, use the grouped GET above.

### Typical flow

1. `GET /team-selection/{projectId}/attendees?role=developer`: pick attendees where `assignedToSlot` is `false`.
2. `GET /team-selection/{projectId}/slots`: find an open developer slot (`status: "open"`, no `user`) and note its `_id`.
3. `PUT /team-selection/slots/{slotId}` with `{ "userId": "<attendee.user._id>" }` invites them. The response is the updated slot.
4. To undo it, `PUT` the same URL with `{}`.

## 8. Utility

| Method | Route | Who | Status | Notes |
|---|---|---|---|---|
| POST | `/user/{userId}/email/{templateId}` | self | ✅ | Sends a SendGrid dynamic template to the caller's own email; the body is the template data. Works with SendGrid mocked; a real send needs `SENDGRID_API_KEY`. |
| POST | `/export` | admin | ⚠️ | Returns a CSV of users, profiles, skills and attendance. **The event is hard-coded** to the one whose `description === 'Weekend for Good 2025'`, so it returns 404 for any other event. `Content-Type` is misspelled `test/csv`. |
| GET | `/settings` | **anyone, no auth** | ⚠️ 🔒 | Returns the function directory and **the name of every environment variable**. It's the only unauthenticated endpoint and looks like a debug leftover. Recommend deleting it or putting it behind admin. |

---

## Cross-cutting issues

1. **Bad input becomes a 500.** No handler catches Mongoose `CastError`/`ValidationError`. Verified examples: `GET /event/abc`, `GET /program/not-an-id`, `GET /projects?eventId=bad`, `POST /event` with missing fields. A shared `isValidObjectId` check plus a try/catch → 400 in the handler wrapper would fix all of them at once.
2. **Inconsistent PUT responses.** Most PUTs return the updated document. `PUT /program`, `PUT /position/{id}/slot` and `PUT /user/{id}/slot` return `{acknowledged, modifiedCount, ...}`.
3. **No cascading deletes.** Program → events, event → attendance and projects, nonprofit → projects, project → positions and slots, and user → attendance and slots are all left behind.
4. **The `nonprofit` role does nothing.** `UserRole.NONPROFIT` exists, but no endpoint grants it any permission.

## Not built yet (🚫)

These are implied by the models, the role enums or code comments, but no endpoint exists:

- **Change a user's role** (admin). `user/index.ts` says _"Permission changes are handled in a separate endpoint"_, but that endpoint doesn't exist. `EDIT_ALL_USERS` is defined but unused. Right now roles can only be changed directly in the DB.
- **Admin view/edit of another user's record or profile.** Admins can list everyone, but can't GET or PUT an individual user or profile.
- **Public / nonprofit project intake.** `Project.reference` is commented _"tracking id for public form submissions"_, and the `nonprofit` role is described as _"sign up as a nonprofit and enter project details"_. But `POST /nonprofit` and `POST /project` are admin-only, and there's no anonymous or nonprofit-role submission route.
- **Volunteer-to-position matching.** Position skills (`minimumLevel`, `importance`) can be stored, but nothing compares them against volunteers' skills.
- **"My invitations" with context.** Volunteers need slot → position → project → event details. Today the client would have to make several extra calls per slot.
- **Admin edits to someone else's attendance** (e.g. setting `allocation`).
- **Parameterized export** (choose the event instead of the hard-coded description).

## Client coverage

Endpoints the React client **calls today**:

- `user`, `users`, `profile`, `profiles`, `email`, `export`
- `events`, `event` (CRUD), `event-attendance` (GET/PUT), `event-attendances`, `programs`
- `nonprofit(s)` (GET/POST/PUT), `project(s)` (GET/POST/PUT)
- `position` (GET/POST/PUT/DELETE), `position/{id}/slot` (GET only)

Endpoints that exist but **have no UI yet**:

- `user/{id}/skills`, skill-options, `skills`, `roles`
- `program` CRUD
- `nonprofit` and `project` DELETE
- `event-attendance` POST/DELETE
- all of `position/{id}/skill`
- all of `team-selection` (slots, attendees, slot assignment)
- `position/{id}/slot` PUT/DELETE
- `user/{id}/slot` (the volunteer accept/decline flow)
