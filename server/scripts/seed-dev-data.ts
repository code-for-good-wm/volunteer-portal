/**
 * Seed the shared dev database with test data to work with:
 *   - volunteers: users + profiles + skill ratings
 *   - nonprofits and their projects (covering every review status)
 *   - events (past, current, upcoming, online, cancelled, draft) and RSVPs
 *
 * The data is deterministic (fixed names, fixed pseudo-random seed), so every run
 * produces the same records. Emails use the reserved example.com / example.org
 * domains and phone numbers use the fictional 555-01xx range, so nothing the
 * app sends (e.g. SendGrid emails) can reach a real person.
 *
 * Seeded users have authProvider "seed" and no Firebase account, so nobody can
 * sign in as them; browse them with your own admin/board account. The script
 * refuses to run if seeded users already exist, so it can't create duplicates.
 *
 * Existing data is never modified. If the "Weekend for Good" program and its
 * 2026 event already exist they're reused (new projects and RSVPs reference
 * them); otherwise they're created.
 *
 * Usage (from the server/ directory):
 *   npm run build
 *   node dist/scripts/seed-dev-data.js            # dry run: validate and report only
 *   node dist/scripts/seed-dev-data.js --yes      # write to the database
 *   node dist/scripts/seed-dev-data.js --yes --manifest ./seed-manifest.json
 *
 * --manifest writes the _id of every inserted document to a JSON file, which
 * is handy if you need to remove exactly what this run added.
 *
 * Connection settings come from DATABASE_URI / DATABASE_PASS / DATABASE_NAME,
 * read from the environment (or a .env file) and, if unset, from the Values
 * block of server/local.settings.json.
 */

import 'dotenv/config';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import * as mongoose from 'mongoose';

import getConfig from '../lib/config';
import { defaultSkillOptions } from '../skill-options/defaults';
import { UserModel } from '../lib/models/user';
import { ProfileModel } from '../lib/models/profile';
import { UserSkillModel } from '../lib/models/user-skill';
import { ProgramModel } from '../lib/models/program';
import { EventModel } from '../lib/models/event';
import { EventAttendanceModel } from '../lib/models/event-attendance';
import { NonprofitModel } from '../lib/models/nonprofit';
import { ProjectModel } from '../lib/models/project';
import { UserRole } from '../lib/models/enums/user-role.enum';
import { Role } from '../lib/models/enums/role.enum';
import { ShirtSize } from '../lib/models/enums/shirt-size.enum';
import { DietaryRestriction } from '../lib/models/enums/dietary-restriction.enum';
import { EventType } from '../lib/models/enums/event-type.enum';
import { Status } from '../lib/models/enums/status.enum';
import { Attendance } from '../lib/models/enums/attendance.enum';
import { Allocation } from '../lib/models/enums/allocation.enum';
import { Is501c3Status } from '../lib/models/enums/is-501c3-status.enum';
import { NonprofitStatus } from '../lib/models/enums/nonprofit-status.enum';
import { ProjectStatus } from '../lib/models/enums/project-status.enum';
import { OnsiteContactAvailability } from '../lib/models/enums/onsite-contact-availability.enum';
import { BrandAssetsStatus } from '../lib/models/enums/brand-assets-status.enum';

const SEED_AUTH_PROVIDER = 'seed';
const { Types } = mongoose;
type Id = mongoose.Types.ObjectId;

const log = (...args: unknown[]) => console.log(...args);

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

/** Fall back to server/local.settings.json for DB settings not in the env. */
const loadLocalSettings = () => {
  const path = join(__dirname, '..', '..', 'local.settings.json');
  const alt = join(__dirname, '..', 'local.settings.json');
  const file = existsSync(path) ? path : existsSync(alt) ? alt : undefined;
  if (!file) return;
  const values = JSON.parse(readFileSync(file, 'utf-8')).Values ?? {};
  for (const key of ['DATABASE_URI', 'DATABASE_PASS', 'DATABASE_NAME']) {
    if (process.env[key] === undefined && values[key] !== undefined) {
      process.env[key] = values[key];
    }
  }
};

/** Small deterministic PRNG (mulberry32) so every run produces the same data. */
const createRandom = (seed: number) => {
  let a = seed;
  const next = () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int: (min: number, max: number) =>
      min + Math.floor(next() * (max - min + 1)),
    pick: <T>(items: T[]): T => items[Math.floor(next() * items.length)],
    chance: (p: number) => next() < p,
  };
};

const rand = createRandom(20261107);
const iso = (d: string) => new Date(d).toISOString();
const clamp = (n: number) => Math.max(0, Math.min(4, n));

// ---------------------------------------------------------------------------
// volunteers
// ---------------------------------------------------------------------------

type VolunteerSeed = {
  firstName: string;
  lastName: string;
  roles: Role[];
  pronouns?: string;
  preferredName?: string;
  employer?: string;
  complete: boolean; // finished profile (agreements, skills, completionDate)
};

const R = Role;
const volunteerSeeds: VolunteerSeed[] = [
  {
    firstName: 'Maya',
    lastName: 'Okafor',
    roles: [R.DEVELOPER, R.LEAD],
    pronouns: 'she/her',
    employer: 'Lakeshore Software',
    complete: true,
  },
  {
    firstName: 'Daniel',
    lastName: 'Reyes',
    roles: [R.DEVELOPER],
    pronouns: 'he/him',
    complete: true,
  },
  {
    firstName: 'Priya',
    lastName: 'Natarajan',
    roles: [R.DESIGNER],
    pronouns: 'she/her',
    employer: 'Riverbend Creative',
    complete: true,
  },
  {
    firstName: 'Samuel',
    lastName: 'Vander Meer',
    roles: [R.DEVELOPER],
    preferredName: 'Sam',
    complete: true,
  },
  {
    firstName: 'Hannah',
    lastName: 'Kowalski',
    roles: [R.DESIGNER, R.LEAD],
    complete: true,
  },
  {
    firstName: 'Marcus',
    lastName: 'Thompson',
    roles: [R.SUPPORT],
    pronouns: 'he/him',
    complete: true,
  },
  {
    firstName: 'Elena',
    lastName: 'Petrova',
    roles: [R.DEVELOPER, R.DESIGNER],
    complete: true,
  },
  {
    firstName: 'Jordan',
    lastName: 'Ellis',
    roles: [R.DEVELOPER],
    pronouns: 'they/them',
    complete: true,
  },
  {
    firstName: 'Aisha',
    lastName: 'Rahman',
    roles: [R.DESIGNER],
    employer: 'Grand Valley Health',
    complete: true,
  },
  {
    firstName: 'Tyler',
    lastName: 'Brooks',
    roles: [R.DEVELOPER, R.LEAD],
    complete: true,
  },
  {
    firstName: 'Mei',
    lastName: 'Lin',
    roles: [R.DEVELOPER],
    pronouns: 'she/her',
    complete: true,
  },
  {
    firstName: 'Christopher',
    lastName: 'Nguyen',
    roles: [R.DEVELOPER],
    preferredName: 'Chris',
    employer: 'Lakeshore Software',
    complete: true,
  },
  {
    firstName: 'Olivia',
    lastName: 'Martinez',
    roles: [R.SUPPORT, R.LEAD],
    complete: true,
  },
  {
    firstName: 'Benjamin',
    lastName: 'Hoekstra',
    roles: [R.DEVELOPER],
    preferredName: 'Ben',
    complete: true,
  },
  {
    firstName: 'Grace',
    lastName: 'Adeyemi',
    roles: [R.DESIGNER],
    pronouns: 'she/her',
    complete: true,
  },
  {
    firstName: 'Noah',
    lastName: 'Fischer',
    roles: [R.DEVELOPER],
    complete: true,
  },
  {
    firstName: 'Sofia',
    lastName: 'Rossi',
    roles: [R.DESIGNER, R.DEVELOPER],
    complete: true,
  },
  {
    firstName: 'Isaac',
    lastName: 'Bennett',
    roles: [R.SUPPORT],
    complete: true,
  },
  {
    firstName: 'Leah',
    lastName: 'Goldberg',
    roles: [R.DEVELOPER],
    pronouns: 'she/her',
    employer: 'Mitten State Bank',
    complete: true,
  },
  {
    firstName: 'Ravi',
    lastName: 'Patel',
    roles: [R.DEVELOPER, R.LEAD],
    complete: true,
  },
  { firstName: 'Emily', lastName: 'Carter', roles: [], complete: false },
  {
    firstName: 'Kwame',
    lastName: 'Asante',
    roles: [R.DEVELOPER],
    complete: false,
  },
  {
    firstName: 'Lucia',
    lastName: 'Fernandez',
    roles: [R.DESIGNER],
    complete: false,
  },
  { firstName: 'Owen', lastName: 'Murphy', roles: [], complete: false },
  { firstName: 'Zoe', lastName: 'Kim', roles: [R.SUPPORT], complete: false },
];

/** Unique skill codes from the app's defaults (some codes appear in two categories). */
const skillCategories = new Map<string, Set<string>>();
for (const { code, category } of defaultSkillOptions) {
  if (!skillCategories.has(code)) skillCategories.set(code, new Set());
  skillCategories.get(code)!.add(category);
}

/** Skill level (0–4) biased by the volunteer's roles. */
const skillLevel = (code: string, roles: Role[]) => {
  const cats = skillCategories.get(code)!;
  let base = 0;
  if (cats.has('technical') && roles.includes(R.DEVELOPER)) base = 2;
  if (cats.has('design') && roles.includes(R.DESIGNER)) base = 2;
  if (cats.has('other')) base = Math.max(base, 1);
  if (code === 'projMgmt' && roles.includes(R.LEAD)) base = 3;
  if (
    roles.includes(R.SUPPORT) &&
    ['testing', 'technicalWriting', 'copy', 'social'].includes(code)
  )
    base = 2;
  return clamp(base + rand.int(-2, 2));
};

const shirtSizes = [
  ShirtSize.SMALL,
  ShirtSize.MEDIUM,
  ShirtSize.MEDIUM,
  ShirtSize.LARGE,
  ShirtSize.LARGE,
  ShirtSize.XL,
  ShirtSize.XXL,
  ShirtSize.NONE,
];
const dietaryOptions: DietaryRestriction[][] = [
  [],
  [],
  [],
  [],
  [],
  [DietaryRestriction.VEGETARIAN],
  [DietaryRestriction.VEGAN],
  [DietaryRestriction.GLUTEN],
  [DietaryRestriction.NUTS],
  [DietaryRestriction.DAIRY, DietaryRestriction.EGGS],
  [DietaryRestriction.OTHER],
];

const buildVolunteers = () => {
  const users: Record<string, unknown>[] = [];
  const profiles: Record<string, unknown>[] = [];
  const skills: Record<string, unknown>[] = [];

  volunteerSeeds.forEach((v, i) => {
    const n = String(i + 1).padStart(2, '0');
    const userId = new Types.ObjectId();
    const handle = `${v.firstName}.${v.lastName}`
      .toLowerCase()
      .replace(/[^a-z.]/g, '');
    const completedAt = iso(
      `2026-0${(i % 9) + 1}-${String((i % 27) + 1).padStart(2, '0')}T15:30:00Z`,
    );

    users.push({
      _id: userId,
      ident: `seed-volunteer-${n}`,
      authProvider: SEED_AUTH_PROVIDER,
      firstName: v.firstName,
      lastName: v.lastName,
      email: `${handle}@example.com`,
      phone: `616555${String(100 + i).padStart(4, '0')}`,
      emailValidated: true,
      userRole: UserRole.VOLUNTEER,
    });

    if (!v.complete) {
      // Mirrors a profile that was created at sign-up but never filled in.
      profiles.push({
        user: userId,
        roles: v.roles,
        dietaryRestrictions: [],
        skills: [],
      });
      return;
    }

    const dietary = rand.pick(dietaryOptions);
    profiles.push({
      user: userId,
      roles: v.roles,
      preferredName: v.preferredName,
      pronouns: v.pronouns,
      linkedInUrl: `https://www.linkedin.com/in/example-${handle.replace('.', '-')}`,
      websiteUrl: rand.chance(0.3)
        ? `https://${handle.replace('.', '')}.example.com`
        : '',
      portfolioUrl: v.roles.includes(R.DESIGNER)
        ? `https://portfolio.example.com/${handle.replace('.', '-')}`
        : '',
      currentEmployer: v.employer,
      previousVolunteer: rand.chance(0.5),
      teamLeadCandidate: v.roles.includes(R.LEAD),
      shirtSize: rand.pick(shirtSizes),
      dietaryRestrictions: dietary,
      additionalDietaryRestrictions: dietary.includes(DietaryRestriction.OTHER)
        ? 'No shellfish'
        : '',
      accessibilityRequirements:
        i === 6
          ? 'Needs a seat near an outlet for a mobility scooter charger'
          : '',
      agreements: {
        termsAndConditions: completedAt,
        photoRelease: i % 7 === 3 ? undefined : completedAt,
        codeOfConduct: completedAt,
      },
      skills: [],
      additionalSkills: rand.pick([
        '',
        '',
        'Grant writing',
        'Spanish (fluent)',
        'Accessibility audits',
        'Data visualization',
      ]),
      aiSkills: rand.pick([
        '',
        '',
        'Uses Copilot daily',
        'Prompt engineering for content drafts',
        'Built a RAG prototype',
      ]),
      completionDate: completedAt,
    });

    for (const code of skillCategories.keys()) {
      skills.push({ user: userId, code, level: skillLevel(code, v.roles) });
    }
  });

  return { users, profiles, skills };
};

// ---------------------------------------------------------------------------
// nonprofits & projects
// ---------------------------------------------------------------------------

const nonprofitSeeds = [
  {
    name: 'Kent County Food Collective',
    website: 'https://kcfoodcollective.example.org',
    description:
      'Coordinates food pantries and volunteer drivers across Kent County.',
    city: 'Grand Rapids',
    state: 'Michigan',
    is501c3: Is501c3Status.YES,
    einNumber: '00-0000101',
    contactName: 'Renee Walters',
    contactRole: 'Executive Director',
    status: NonprofitStatus.ACCEPTED,
    notes: 'Great partner from 2025; returning with a follow-up project.',
  },
  {
    name: 'Lakeshore Literacy Project',
    website: 'https://lakeshoreliteracy.example.org',
    description:
      'Free adult literacy tutoring and ESL classes along the lakeshore.',
    city: 'Holland',
    state: 'Michigan',
    is501c3: Is501c3Status.YES,
    einNumber: '00-0000102',
    contactName: 'Tomás Herrera',
    contactRole: 'Program Coordinator',
    status: NonprofitStatus.ACCEPTED,
  },
  {
    name: 'Heritage Hill Youth Arts',
    website: 'https://hhyoutharts.example.org',
    description:
      'After-school art and music programs for middle and high school students.',
    city: 'Grand Rapids',
    state: 'Michigan',
    is501c3: Is501c3Status.IN_PROGRESS,
    contactName: 'Janelle Price',
    contactRole: 'Founder',
    status: NonprofitStatus.INTERESTED,
    notes: '501(c)(3) application filed this spring.',
  },
  {
    name: 'River Valley Animal Rescue',
    description: 'Foster-based dog and cat rescue run entirely by volunteers.',
    city: 'Grandville',
    state: 'Michigan',
    is501c3: Is501c3Status.NO,
    contactName: 'Pete Duncan',
    contactRole: 'Volunteer Coordinator',
    status: NonprofitStatus.INTERESTED,
  },
  {
    name: 'Westside Tenants Union',
    website: 'https://westsidetenants.example.org',
    description:
      'Helps renters understand their rights and organize with neighbors.',
    city: 'Kalamazoo',
    state: 'Michigan',
    is501c3: Is501c3Status.YES,
    einNumber: '00-0000105',
    contactName: 'Alicia Moreno',
    contactRole: 'Board Chair',
    status: NonprofitStatus.ARCHIVED,
    notes: 'Org paused operations in 2026.',
  },
];

const buildNonprofits = () =>
  nonprofitSeeds.map((n, i) => ({
    _id: new Types.ObjectId(),
    ...n,
    contactEmail: `${n.contactName
      .split(' ')[0]
      .toLowerCase()
      .replace(/[^a-z]/g, '')}@example.org`,
    contactPhone: `616555${String(150 + i).padStart(4, '0')}`,
  }));

type ProjectSeed = {
  nonprofit: number; // index into nonprofitSeeds
  event?: 'wfg2025' | 'wfg2026' | 'hackNight';
  name: string;
  description: string;
  problem: string;
  status: ProjectStatus;
  successCriteria: string;
  whoUsesIt: string;
  existingSystem?: string;
  timeline: string;
  onsite: OnsiteContactAvailability;
  brandAssets: BrandAssetsStatus;
  submittedAt: string;
  notes?: string;
};

const projectSeeds: ProjectSeed[] = [
  {
    nonprofit: 0,
    event: 'wfg2025',
    status: ProjectStatus.ACCEPTED,
    name: 'Volunteer Driver Scheduler',
    description:
      'A web app for scheduling volunteer drivers for pantry pickups.',
    problem:
      'Driver shifts are managed in a shared spreadsheet that frequently gets overwritten.',
    successCriteria:
      'Drivers can claim shifts themselves and coordinators get a daily summary.',
    whoUsesIt: 'About 60 volunteer drivers and 3 staff coordinators.',
    existingSystem: 'Google Sheets and group texts',
    timeline: 'Needed before the holiday rush',
    onsite: OnsiteContactAvailability.IN_PERSON,
    brandAssets: BrandAssetsStatus.YES,
    submittedAt: '2025-06-12T14:00:00Z',
  },
  {
    nonprofit: 0,
    event: 'wfg2026',
    status: ProjectStatus.ACCEPTED,
    name: 'Pantry Inventory Dashboard',
    description: 'A dashboard showing stock levels across partner pantries.',
    problem:
      'Pantries over-order some items and run out of others because nobody sees the full picture.',
    successCriteria:
      'Each pantry updates stock weekly and staff can see shortages at a glance.',
    whoUsesIt: '12 partner pantries and the central warehouse team.',
    existingSystem: 'Emailed Excel files',
    timeline: 'Spring 2027',
    onsite: OnsiteContactAvailability.IN_PERSON,
    brandAssets: BrandAssetsStatus.YES,
    submittedAt: '2026-05-20T16:30:00Z',
  },
  {
    nonprofit: 1,
    event: 'wfg2026',
    status: ProjectStatus.ACCEPTED,
    name: 'Tutor Matching Portal',
    description:
      'Match adult learners with tutors based on schedule, language and location.',
    problem:
      'Matching is done by hand from paper intake forms and takes weeks.',
    successCriteria:
      'New learners are matched with a tutor within one week of signing up.',
    whoUsesIt: 'About 200 learners and 80 volunteer tutors.',
    existingSystem: 'Paper forms and a Wix site',
    timeline: 'Before the January session',
    onsite: OnsiteContactAvailability.REMOTE,
    brandAssets: BrandAssetsStatus.PARTIAL,
    submittedAt: '2026-06-03T13:15:00Z',
    notes: 'Contact is available by video call all weekend.',
  },
  {
    nonprofit: 1,
    event: 'hackNight',
    status: ProjectStatus.ACCEPTED,
    name: 'Accessible Class Calendar',
    description:
      'Rebuild the public class calendar so it works with screen readers and on phones.',
    problem:
      'The current calendar embed is unusable on mobile and with assistive technology.',
    successCriteria:
      'Calendar passes a WCAG 2.2 AA audit and is usable on a phone.',
    whoUsesIt: 'Learners and the public.',
    existingSystem: 'Embedded Google Calendar',
    timeline: 'Flexible',
    onsite: OnsiteContactAvailability.REMOTE,
    brandAssets: BrandAssetsStatus.PARTIAL,
    submittedAt: '2026-09-18T18:00:00Z',
  },
  {
    nonprofit: 2,
    status: ProjectStatus.PROPOSED,
    name: 'Student Showcase Website',
    description: 'A site to show off student artwork and promote recitals.',
    problem:
      'There is no web presence, so families and donors never see the students’ work.',
    successCriteria: 'Staff can upload artwork and events without help.',
    whoUsesIt: 'Families, donors and staff.',
    timeline: 'Summer 2027',
    onsite: OnsiteContactAvailability.IN_PERSON,
    brandAssets: BrandAssetsStatus.NO,
    submittedAt: '2026-10-02T20:45:00Z',
  },
  {
    nonprofit: 3,
    status: ProjectStatus.PROPOSED,
    name: 'Foster Application Tracker',
    description:
      'Track foster applications from submission through home visit and approval.',
    problem:
      'Applications get lost between volunteers and applicants wait months to hear back.',
    successCriteria:
      'Every application has an owner and a status applicants can check.',
    whoUsesIt: 'About 15 intake volunteers.',
    existingSystem: 'Facebook messages and a shared inbox',
    timeline: 'ASAP',
    onsite: OnsiteContactAvailability.NONE,
    brandAssets: BrandAssetsStatus.NO,
    submittedAt: '2026-10-21T12:10:00Z',
  },
  {
    nonprofit: 3,
    status: ProjectStatus.REJECTED,
    name: 'Mobile Adoption App',
    description: 'Native iOS and Android apps for browsing adoptable animals.',
    problem: 'Adopters want to browse animals on their phones.',
    successCriteria: 'Apps published in both app stores.',
    whoUsesIt: 'Potential adopters.',
    timeline: 'Within one weekend',
    onsite: OnsiteContactAvailability.NONE,
    brandAssets: BrandAssetsStatus.NO,
    submittedAt: '2026-04-08T09:00:00Z',
    notes:
      'Too large for a weekend and no one to maintain native apps; suggested a mobile-friendly site instead.',
  },
  {
    nonprofit: 4,
    status: ProjectStatus.ARCHIVED,
    name: 'Know Your Rights Chatbot',
    description: 'A chatbot that answers common renter questions.',
    problem: 'Staff answer the same questions by phone dozens of times a week.',
    successCriteria: 'Half of common questions answered without a phone call.',
    whoUsesIt: 'Renters in Kalamazoo County.',
    existingSystem: 'Phone hotline',
    timeline: 'Fall 2026',
    onsite: OnsiteContactAvailability.REMOTE,
    brandAssets: BrandAssetsStatus.YES,
    submittedAt: '2026-02-14T17:20:00Z',
    notes: 'Archived when the organization paused operations.',
  },
];

// ---------------------------------------------------------------------------
// programs & events
// ---------------------------------------------------------------------------

const buildEvents = (wfgProgramId: Id, workshopsProgramId: Id) => ({
  wfg2025: {
    _id: new Types.ObjectId(),
    program: wfgProgramId,
    name: 'Weekend for Good 2025',
    description:
      'Our annual 48-hour build weekend for West Michigan nonprofits.',
    additionalInfo:
      'Breakfast and lunch provided both days. Parking in the north ramp.',
    startDate: iso('2025-11-07T22:00:00Z'),
    endDate: iso('2025-11-09T22:00:00Z'),
    rsvpDeadline: iso('2025-10-17T04:00:00Z'),
    location: '120 Example Ave NW, Grand Rapids, MI 49503',
    allowSignUps: false,
    allowPartialAttendance: true,
    allocationRequired: true,
    eventType: EventType.IN_PERSON,
    status: Status.COMPLETE,
  },
  hackNight: {
    _id: new Types.ObjectId(),
    program: workshopsProgramId,
    name: 'Spring Hack Night 2027',
    description:
      'An evening of small fixes and improvements for past partner projects.',
    additionalInfo: 'Join in person or online. Pizza for in-person volunteers.',
    startDate: iso('2027-03-12T22:00:00Z'),
    endDate: iso('2027-03-13T03:00:00Z'),
    rsvpDeadline: iso('2027-03-05T04:00:00Z'),
    location: '45 Example St SE, Grand Rapids, MI 49503',
    allowSignUps: true,
    allowPartialAttendance: false,
    allocationRequired: true,
    eventType: EventType.HYBRID,
    status: Status.UPCOMING,
  },
  designSprint: {
    _id: new Types.ObjectId(),
    program: workshopsProgramId,
    name: 'Virtual Design Sprint',
    description:
      'A two-day remote design sprint focused on nonprofit branding and UX.',
    additionalInfo: 'Video call link will be emailed the week before.',
    startDate: iso('2027-01-23T14:00:00Z'),
    endDate: iso('2027-01-24T22:00:00Z'),
    rsvpDeadline: iso('2027-01-16T04:00:00Z'),
    location: 'Online',
    allowSignUps: true,
    allowPartialAttendance: true,
    allocationRequired: false,
    eventType: EventType.ONLINE,
    status: Status.UPCOMING,
  },
  buildDay: {
    _id: new Types.ObjectId(),
    program: workshopsProgramId,
    name: 'Summer Build Day 2026',
    description: 'A one-day build event for small website refreshes.',
    additionalInfo: 'Cancelled due to venue availability.',
    startDate: iso('2026-07-18T13:00:00Z'),
    endDate: iso('2026-07-18T23:00:00Z'),
    location: '120 Example Ave NW, Grand Rapids, MI 49503',
    allowSignUps: false,
    allowPartialAttendance: false,
    allocationRequired: false,
    eventType: EventType.IN_PERSON,
    status: Status.CANCELLED,
  },
  wfg2027: {
    _id: new Types.ObjectId(),
    program: wfgProgramId,
    name: 'Weekend for Good 2027',
    description:
      'Next year’s annual build weekend. Details still being planned.',
    additionalInfo: '',
    startDate: iso('2027-11-05T22:00:00Z'),
    endDate: iso('2027-11-07T22:00:00Z'),
    location: '',
    allowSignUps: false,
    allowPartialAttendance: true,
    allocationRequired: true,
    eventType: EventType.IN_PERSON,
    status: Status.DRAFT,
  },
});

// ---------------------------------------------------------------------------
// attendance
// ---------------------------------------------------------------------------

type AttendanceSpec = {
  event: Id;
  volunteers: number[]; // indexes into volunteerSeeds
  allocate: boolean; // whether board members have already assigned allocations
};

const PARTIAL_DETAILS = [
  'Saturday only',
  'Arriving Saturday afternoon',
  'Friday night and Saturday',
  'Leaving Sunday at noon',
];
const DECLINE_DETAILS = ['Out of town that weekend', 'Family commitment', ''];

const buildAttendance = (userIds: Id[], specs: AttendanceSpec[]) => {
  const docs: Record<string, unknown>[] = [];
  for (const { event, volunteers, allocate } of specs) {
    for (const i of volunteers) {
      const roll = rand.next();
      const attendance =
        roll < 0.72
          ? Attendance.ATTENDING
          : roll < 0.88
            ? Attendance.PARTIAL_ATTENDING
            : Attendance.NOT_ATTENDING;
      const roles = volunteerSeeds[i].roles;
      let allocation = Allocation.UNASSIGNED;
      if (allocate && attendance !== Attendance.NOT_ATTENDING) {
        allocation = rand.pick([
          Allocation.ASSIGNED,
          Allocation.ASSIGNED,
          Allocation.ASSIGNED,
          Allocation.BACKUP,
          Allocation.GENERAL,
          Allocation.FLOAT,
        ]);
      }
      let attendanceDetail = '';
      if (attendance === Attendance.PARTIAL_ATTENDING) {
        attendanceDetail = rand.pick(PARTIAL_DETAILS);
      } else if (attendance === Attendance.NOT_ATTENDING) {
        attendanceDetail = rand.pick(DECLINE_DETAILS);
      }
      docs.push({
        user: userIds[i],
        event,
        attendance,
        attendanceDetail,
        roles:
          attendance === Attendance.NOT_ATTENDING
            ? []
            : roles.length
              ? roles
              : [R.SUPPORT],
        allocation,
      });
    }
  }
  return docs;
};

// ---------------------------------------------------------------------------
// main
// ---------------------------------------------------------------------------

const validateAll = (
  label: string,
  Model: mongoose.Model<any>,
  docs: Record<string, unknown>[],
) => {
  docs.forEach((d, i) => {
    const err = new Model(d).validateSync();
    if (err)
      throw new Error(`${label}[${i}] failed validation: ${err.message}`);
  });
};

const run = async () => {
  const args = process.argv.slice(2);
  const write = args.includes('--yes');
  const manifestIdx = args.indexOf('--manifest');
  const manifestPath = manifestIdx >= 0 ? args[manifestIdx + 1] : undefined;
  if (manifestIdx >= 0 && !manifestPath)
    throw new Error('--manifest needs a file path');

  loadLocalSettings();
  const config = await getConfig();
  if (!config.database.connectionString) {
    throw new Error(
      'No database connection string provided (set DATABASE_URI).',
    );
  }
  // host[:port] only, never credentials
  const host =
    config.database.connectionString.match(/\/\/(?:[^@/]*@)?([^/?]+)/)?.[1] ??
    'unknown host';

  await mongoose.connect(config.database.connectionString, {
    dbName: config.database.databaseName,
  });
  log(`Connected to "${config.database.databaseName}" on ${host}.`);
  log(write ? 'Mode: WRITE' : 'Mode: dry run (pass --yes to write)');

  try {
    const existingSeed = await UserModel.countDocuments({
      authProvider: SEED_AUTH_PROVIDER,
    });
    if (existingSeed > 0) {
      throw new Error(
        `Found ${existingSeed} users with authProvider "${SEED_AUTH_PROVIDER}"; this data has already been seeded.`,
      );
    }

    // Reuse the existing "Weekend for Good" program and its 2026 event when present.
    const newPrograms: Record<string, unknown>[] = [];
    let wfgProgram = await ProgramModel.findOne({
      name: /weekend for good/i,
    }).lean();
    if (!wfgProgram) {
      const doc = {
        _id: new Types.ObjectId(),
        name: 'Weekend for Good',
        description: 'Weekend for Good',
        imageUrl: '',
        events: [],
      };
      newPrograms.push(doc);
      wfgProgram = doc as any;
    }
    const workshops = {
      _id: new Types.ObjectId(),
      name: 'Community Workshops',
      description:
        'Shorter events throughout the year: hack nights, design sprints and build days.',
      imageUrl: '',
      events: [],
    };
    newPrograms.push(workshops);

    const eventMap = buildEvents(wfgProgram!._id as Id, workshops._id);
    const newEvents: Record<string, unknown>[] = [
      eventMap.wfg2025,
      eventMap.hackNight,
      eventMap.designSprint,
      eventMap.buildDay,
      eventMap.wfg2027,
    ];

    let wfg2026 = await EventModel.findOne({
      program: wfgProgram!._id,
      startDate: { $gte: new Date('2026-01-01'), $lt: new Date('2027-01-01') },
    }).lean();
    if (wfg2026) {
      log(
        `Reusing existing event "${wfg2026.name}" (${wfg2026._id}) as Weekend for Good 2026.`,
      );
    } else {
      const doc = {
        _id: new Types.ObjectId(),
        program: wfgProgram!._id,
        name: 'Weekend for Good 2026',
        description: 'Weekend for Good 2026',
        additionalInfo: '',
        startDate: iso('2026-11-06T22:00:00Z'),
        endDate: iso('2026-11-08T22:00:00Z'),
        rsvpDeadline: iso('2026-10-16T04:00:00Z'),
        location: '120 Example Ave NW, Grand Rapids, MI 49503',
        allowSignUps: true,
        allowPartialAttendance: true,
        allocationRequired: true,
        eventType: EventType.IN_PERSON,
        status: Status.UPCOMING,
      };
      newEvents.push(doc);
      wfg2026 = doc as any;
    }
    const eventIds = {
      wfg2025: eventMap.wfg2025._id,
      wfg2026: wfg2026!._id as Id,
      hackNight: eventMap.hackNight._id,
    };

    const { users, profiles, skills } = buildVolunteers();
    const nonprofits = buildNonprofits();
    const projects = projectSeeds.map(({ nonprofit, event, onsite, ...p }) => ({
      ...p,
      nonprofit: nonprofits[nonprofit]._id,
      event: event ? eventIds[event] : undefined,
      onsiteContactAvailability: onsite,
      onsiteContactName:
        onsite === OnsiteContactAvailability.NONE
          ? undefined
          : nonprofitSeeds[nonprofit].contactName,
      submittedAt: new Date(p.submittedAt),
    }));

    const userIds = users.map((u) => u._id as Id);
    const range = (a: number, b: number) =>
      Array.from({ length: b - a + 1 }, (_, k) => a + k);
    const attendance = buildAttendance(userIds, [
      { event: eventMap.wfg2025._id, volunteers: range(0, 15), allocate: true },
      {
        event: eventIds.wfg2026,
        volunteers: [...range(0, 11), 16, 17, 18, 19, 21],
        allocate: true,
      },
      {
        event: eventMap.hackNight._id,
        volunteers: [1, 3, 7, 10, 13, 15, 19, 21],
        allocate: false,
      },
      {
        event: eventMap.designSprint._id,
        volunteers: [2, 4, 8, 14, 16, 22],
        allocate: false,
      },
    ]);

    const plan: [string, mongoose.Model<any>, Record<string, unknown>[]][] = [
      ['programs', ProgramModel, newPrograms],
      ['events', EventModel, newEvents],
      ['users', UserModel, users],
      ['profiles', ProfileModel, profiles],
      ['userskills', UserSkillModel, skills],
      ['nonprofits', NonprofitModel, nonprofits],
      ['projects', ProjectModel, projects],
      ['eventattendances', EventAttendanceModel, attendance],
    ];

    for (const [label, Model, docs] of plan) validateAll(label, Model, docs);
    log('\nAll documents pass schema validation. To insert:');
    for (const [label, , docs] of plan)
      log(`  ${label.padEnd(18)} ${docs.length}`);

    if (!write) {
      log('\nDry run complete. Nothing was written.');
      return;
    }

    const manifest: Record<string, string[]> = {};
    const saveManifest = () =>
      manifestPath &&
      writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    try {
      for (const [label, Model, docs] of plan) {
        manifest[label] = [];
        // Insert in small batches to stay well under Cosmos DB request-unit limits.
        for (let i = 0; i < docs.length; i += 50) {
          const inserted = (await Model.insertMany(docs.slice(i, i + 50), {
            ordered: true,
          })) as unknown as { _id: Id }[];
          manifest[label].push(...inserted.map((d) => String(d._id)));
        }
        log(`  inserted ${label}: ${manifest[label].length}`);
      }
    } finally {
      saveManifest();
      if (manifestPath)
        log(`Manifest of inserted ids written to ${manifestPath}.`);
    }
    log('\nSeed complete.');
  } finally {
    await mongoose.disconnect();
  }
};

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err.message ?? err);
    process.exit(1);
  });
