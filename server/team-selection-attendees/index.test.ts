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

  it("groups the event's attendees by role, repeating multi-role attendees", async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1', event: 'e1' } as never);
    const both = {
      _id: 'a1',
      user: { _id: 'u1' },
      roles: ['developer', 'designer'],
    };
    const devOnly = { _id: 'a2', user: { _id: 'u2' }, roles: ['developer'] };
    mockListAttendees.mockResolvedValue([both, devOnly] as never);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(mockListAttendees).toHaveBeenCalledWith('e1');
    expect(context.res?.status).toBe(200);
    const bothOut = { ...both, assignedToSlot: false };
    expect(context.res?.body).toEqual({
      developer: [bothOut, { ...devOnly, assignedToSlot: false }],
      designer: [bothOut],
    });
  });

  it('returns only the requested role when a role query param is given', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1', event: 'e1' } as never);
    const both = {
      _id: 'a1',
      user: { _id: 'u1' },
      roles: ['developer', 'designer'],
    };
    const designerOnly = {
      _id: 'a2',
      user: { _id: 'u2' },
      roles: ['designer'],
    };
    mockListAttendees.mockResolvedValue([both, designerOnly] as never);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(
      context,
      createMockRequest({ method: 'GET', query: { role: 'designer' } }),
    );

    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toEqual({
      designer: [
        { ...both, assignedToSlot: false },
        { ...designerOnly, assignedToSlot: false },
      ],
    });
  });

  it('returns an empty object when nobody matches the requested role', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1', event: 'e1' } as never);
    mockListAttendees.mockResolvedValue([
      { _id: 'a1', user: { _id: 'u1' }, roles: ['developer'] },
    ] as never);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(
      context,
      createMockRequest({ method: 'GET', query: { role: 'support' } }),
    );

    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toEqual({});
  });

  it('returns 400 for an unknown role', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1', event: 'e1' } as never);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(
      context,
      createMockRequest({ method: 'GET', query: { role: 'wizard' } }),
    );

    expect(context.res?.status).toBe(400);
    expect(mockListAttendees).not.toHaveBeenCalled();
  });

  it('flags attendees who already hold a slot for the event, under every role', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1', event: 'e1' } as never);
    const assigned = {
      _id: 'a1',
      user: { _id: 'u1' },
      roles: ['developer', 'designer'],
    };
    const free = { _id: 'a2', user: { _id: 'u2' }, roles: ['developer'] };
    mockListAttendees.mockResolvedValue([assigned, free] as never);
    mockAssignedUsers.mockResolvedValue(['u1'] as never);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(mockAssignedUsers).toHaveBeenCalledWith('e1');
    expect(context.res?.body).toEqual({
      developer: [
        { ...assigned, assignedToSlot: true },
        { ...free, assignedToSlot: false },
      ],
      designer: [{ ...assigned, assignedToSlot: true }],
    });
  });
});
