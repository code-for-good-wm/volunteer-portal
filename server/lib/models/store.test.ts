import { Types } from 'mongoose';
import { beforeEach, describe, expect, it } from 'vitest';
import { useMongoMemoryServer } from '../test-utils/mongoMemoryServer';
import {
  eventStore,
  nonprofitStore,
  positionStore,
  positionSkillStore,
  programStore,
  projectStore,
  slotStore,
  userStore,
} from './store';
import { IUser } from './user';
import { UserRole } from './enums/user-role.enum';
import { IEvent } from './event';
import { EventType } from './enums/event-type.enum';
import { Status } from './enums/status.enum';
import { IProgram } from './program';
import { INonprofit } from './nonprofit';
import { Is501c3Status } from './enums/is-501c3-status.enum';
import { NonprofitStatus } from './enums/nonprofit-status.enum';
import { IProject } from './project';
import { ProjectStatus } from './enums/project-status.enum';
import { IPosition } from './position';
import { Role } from './enums/role.enum';
import { ISlot } from './slot';
import { SlotStatus } from './enums/slot-status.enum';

useMongoMemoryServer();

function buildUser(overrides: Partial<IUser> = {}): IUser {
  return {
    ident: 'ident-1',
    authProvider: 'firebase',
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '5551234567',
    userRole: UserRole.VOLUNTEER,
    ...overrides,
  } as IUser;
}

async function buildEvent(overrides: Partial<IEvent> = {}) {
  const program = await programStore.create({
    name: 'Program',
    description: 'A program',
    imageUrl: '',
  } as IProgram);

  return await eventStore.create({
    program: program._id,
    name: 'Event',
    description: 'An event',
    additionalInfo: '',
    startDate: new Date('2024-06-01'),
    endDate: new Date('2024-06-02'),
    location: 'Somewhere',
    allowSignUps: true,
    allowPartialAttendance: false,
    allocationRequired: false,
    eventType: EventType.IN_PERSON,
    status: Status.UPCOMING,
    ...overrides,
  } as IEvent);
}

async function buildProject(eventId?: Types.ObjectId) {
  const nonprofit = await nonprofitStore.create({
    name: 'Nonprofit',
    description: 'A nonprofit',
    city: 'Chicago',
    state: 'IL',
    is501c3: Is501c3Status.YES,
    contactName: 'Contact',
    contactRole: 'ED',
    contactEmail: 'contact@example.com',
    contactPhone: '5559876543',
    status: NonprofitStatus.ACCEPTED,
  } as INonprofit);

  return await projectStore.create({
    nonprofit: nonprofit._id,
    event: eventId,
    name: 'Project',
    description: 'A project',
    problem: 'A problem',
    status: ProjectStatus.ACCEPTED,
  } as IProject);
}

describe('userStore', () => {
  it('creates and lists a user by ident', async () => {
    await userStore.create(buildUser());

    const found = await userStore.list('ident-1');

    expect(found).not.toBeNull();
    expect(found?.email).toBe('ada@example.com');
  });

  it('returns null when no user matches the ident', async () => {
    expect(await userStore.list('missing')).toBeNull();
  });

  it('updates a user by _id and ident', async () => {
    const created = await userStore.create(buildUser());

    await userStore.update(created._id as Types.ObjectId, 'ident-1', {
      ...buildUser(),
      firstName: 'Grace',
    });

    const updated = await userStore.list('ident-1');
    expect(updated?.firstName).toBe('Grace');
  });

  it('deletes a user by _id and ident', async () => {
    const created = await userStore.create(buildUser());

    await userStore.delete(created._id as Types.ObjectId, 'ident-1');

    expect(await userStore.list('ident-1')).toBeNull();
  });
});

describe('eventStore.upcoming', () => {
  it('includes events with UPCOMING status', async () => {
    await buildEvent({ status: Status.UPCOMING });

    const events = await eventStore.upcoming();

    expect(events).toHaveLength(1);
  });

  it('includes ACTIVE events that have not yet ended', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    await buildEvent({ status: Status.ACTIVE, endDate: new Date(future) });

    const events = await eventStore.upcoming();

    expect(events).toHaveLength(1);
  });

  it('excludes ACTIVE events that have already ended', async () => {
    const past = new Date(Date.now() - 86_400_000).toISOString();
    await buildEvent({ status: Status.ACTIVE, endDate: new Date(past) });

    const events = await eventStore.upcoming();

    expect(events).toHaveLength(0);
  });

  it('excludes DRAFT and COMPLETE events', async () => {
    await buildEvent({ status: Status.DRAFT });
    await buildEvent({ status: Status.COMPLETE });

    const events = await eventStore.upcoming();

    expect(events).toHaveLength(0);
  });
});

describe('positionStore', () => {
  it('creates one open Slot per slotCount when creating a Position', async () => {
    const project = await buildProject();

    const position = await positionStore.create({
      project: project._id,
      role: Role.DEVELOPER,
      slotCount: 3,
    } as IPosition);

    const slots = await slotStore.listByPosition(
      position._id as Types.ObjectId,
    );

    expect(slots).toHaveLength(3);
    expect(slots.every((slot) => slot.status === SlotStatus.OPEN)).toBe(true);
  });

  it('cascades deletion of Slots and PositionSkills when a Position is deleted', async () => {
    const project = await buildProject();
    const position = await positionStore.create({
      project: project._id,
      role: Role.DESIGNER,
      slotCount: 2,
    } as IPosition);
    await positionSkillStore.create(
      position._id as Types.ObjectId,
      {
        code: 'figma',
        minimumLevel: 1,
        importance: 'required',
      } as never,
    );

    await positionStore.delete(position._id as Types.ObjectId);

    expect(
      await slotStore.listByPosition(position._id as Types.ObjectId),
    ).toHaveLength(0);
    expect(
      await positionSkillStore.listByPosition(position._id as Types.ObjectId),
    ).toHaveLength(0);
  });
});

describe('slotStore.hasConfirmedSlotForEvent', () => {
  let userId: Types.ObjectId;

  beforeEach(async () => {
    const user = await userStore.create(buildUser());
    userId = user._id as Types.ObjectId;
  });

  it('returns false when the user has no confirmed slot for the event', async () => {
    const event = await buildEvent();
    const project = await buildProject(event._id as Types.ObjectId);
    const position = await positionStore.create({
      project: project._id,
      role: Role.SUPPORT,
      slotCount: 1,
    } as IPosition);

    const result = await slotStore.hasConfirmedSlotForEvent(
      userId,
      position._id as Types.ObjectId,
    );

    expect(result).toBe(false);
  });

  it('returns true when the user holds a CONFIRMED slot on a position tied to the event', async () => {
    const event = await buildEvent();
    const project = await buildProject(event._id as Types.ObjectId);
    const position = await positionStore.create({
      project: project._id,
      role: Role.SUPPORT,
      slotCount: 1,
    } as IPosition);
    const [slot] = await slotStore.listByPosition(
      position._id as Types.ObjectId,
    );
    await slotStore.update(
      slot._id as Types.ObjectId,
      {
        ...slot.toObject(),
        user: userId,
        status: SlotStatus.CONFIRMED,
      } as ISlot,
    );

    const result = await slotStore.hasConfirmedSlotForEvent(
      userId,
      position._id as Types.ObjectId,
    );

    expect(result).toBe(true);
  });

  it('ignores the excluded slot id', async () => {
    const event = await buildEvent();
    const project = await buildProject(event._id as Types.ObjectId);
    const position = await positionStore.create({
      project: project._id,
      role: Role.SUPPORT,
      slotCount: 1,
    } as IPosition);
    const [slot] = await slotStore.listByPosition(
      position._id as Types.ObjectId,
    );
    await slotStore.update(
      slot._id as Types.ObjectId,
      {
        ...slot.toObject(),
        user: userId,
        status: SlotStatus.CONFIRMED,
      } as ISlot,
    );

    const result = await slotStore.hasConfirmedSlotForEvent(
      userId,
      position._id as Types.ObjectId,
      slot._id as Types.ObjectId,
    );

    expect(result).toBe(false);
  });

  it('returns false when the position has no project/event assigned yet', async () => {
    const project = await buildProject();
    const position = await positionStore.create({
      project: project._id,
      role: Role.SUPPORT,
      slotCount: 1,
    } as IPosition);

    const result = await slotStore.hasConfirmedSlotForEvent(
      userId,
      position._id as Types.ObjectId,
    );

    expect(result).toBe(false);
  });
});
