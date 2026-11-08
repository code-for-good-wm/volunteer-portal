import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockContext,
  createMockRequest,
} from '../lib/test-utils/mockContext';
import { UserRole } from '../lib/models/enums/user-role.enum';

vi.mock('../lib/helpers', () => ({
  checkAuthAndConnect: vi.fn(),
}));
vi.mock('../lib/models/store', () => ({
  userStore: { list: vi.fn() },
  projectStore: { list: vi.fn() },
  eventAttendanceStore: { listAttendeesByEvent: vi.fn() },
  slotStore: { listAssignedUsersByEvent: vi.fn() },
}));

import { checkAuthAndConnect } from '../lib/helpers';
import {
  userStore,
  projectStore,
  eventAttendanceStore,
  slotStore,
} from '../lib/models/store';
import httpTrigger from './index';

const mockUserList = vi.mocked(userStore.list);
const mockProjectList = vi.mocked(projectStore.list);
const mockListAttendees = vi.mocked(eventAttendanceStore.listAttendeesByEvent);
const mockAssignedUsers = vi.mocked(slotStore.listAssignedUsersByEvent);

describe('team-selection-attendees httpTrigger GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkAuthAndConnect).mockResolvedValue({ uid: 'firebase-uid' });
    mockAssignedUsers.mockResolvedValue([]);
  });

  it('forbids callers without team-selection permission', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.VOLUNTEER } as never);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res?.status).toBe(403);
    expect(mockListAttendees).not.toHaveBeenCalled();
  });

  it('returns 404 when the project does not exist', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue(null);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res?.status).toBe(404);
  });

  it('returns 400 when the project has no event yet', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1' } as never);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res?.status).toBe(400);
    expect(mockListAttendees).not.toHaveBeenCalled();
  });

  const request = (query: Record<string, string> = {}) =>
    createMockRequest({ method: 'GET', query });
  const forProject = () =>
    createMockContext({ bindingData: { projectId: 'p1' } });
  const attendance = (id: string, roles: string[]) => ({
    _id: `a-${id}`,
    user: { _id: id },
    roles,
  });

  beforeEach(() => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1', event: 'e1' } as never);
  });

  it("returns the event's attendees as a flat list, once per attendance record however many roles it has", async () => {
    const both = attendance('u1', ['developer', 'designer']);
    const devOnly = attendance('u2', ['developer']);
    mockListAttendees.mockResolvedValue([both, devOnly] as never);
    const context = forProject();

    await httpTrigger(context, request());

    expect(mockListAttendees).toHaveBeenCalledWith('e1');
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toEqual({
      results: [
        { ...both, assignedToSlot: false },
        { ...devOnly, assignedToSlot: false },
      ],
      filter: { projectId: 'p1', eventId: 'e1' },
    });
  });

  it('includes attendees without roles when no role filter is given', async () => {
    const noRoles = attendance('u1', []);
    mockListAttendees.mockResolvedValue([noRoles] as never);
    const context = forProject();

    await httpTrigger(context, request());

    expect(context.res?.body).toMatchObject({
      results: [{ ...noRoles, assignedToSlot: false }],
    });
  });

  it('limits the list to attendees with the requested role', async () => {
    const both = attendance('u1', ['developer', 'designer']);
    const designerOnly = attendance('u2', ['designer']);
    const devOnly = attendance('u3', ['developer']);
    mockListAttendees.mockResolvedValue([both, designerOnly, devOnly] as never);
    const context = forProject();

    await httpTrigger(context, request({ role: 'designer' }));

    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toEqual({
      results: [
        { ...both, assignedToSlot: false },
        { ...designerOnly, assignedToSlot: false },
      ],
      filter: { projectId: 'p1', eventId: 'e1', role: 'designer' },
    });
  });

  it('returns empty results when nobody matches the requested role', async () => {
    mockListAttendees.mockResolvedValue([
      attendance('u1', ['developer']),
    ] as never);
    const context = forProject();

    await httpTrigger(context, request({ role: 'support' }));

    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toEqual({
      results: [],
      filter: { projectId: 'p1', eventId: 'e1', role: 'support' },
    });
  });

  it('returns 400 for an unknown role', async () => {
    const context = forProject();

    await httpTrigger(context, request({ role: 'wizard' }));

    expect(context.res?.status).toBe(400);
    expect(mockListAttendees).not.toHaveBeenCalled();
  });

  it('flags attendees who already hold a slot for the event', async () => {
    const assigned = attendance('u1', ['developer', 'designer']);
    const free = attendance('u2', ['developer']);
    mockListAttendees.mockResolvedValue([assigned, free] as never);
    mockAssignedUsers.mockResolvedValue(['u1'] as never);
    const context = forProject();

    await httpTrigger(context, request());

    expect(mockAssignedUsers).toHaveBeenCalledWith('e1');
    expect(context.res?.body).toMatchObject({
      results: [
        { ...assigned, assignedToSlot: true },
        { ...free, assignedToSlot: false },
      ],
    });
  });
});
