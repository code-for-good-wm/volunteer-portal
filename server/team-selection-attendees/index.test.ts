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
}));

import { checkAuthAndConnect } from '../lib/helpers';
import {
  userStore,
  projectStore,
  eventAttendanceStore,
} from '../lib/models/store';
import httpTrigger from './index';

const mockUserList = vi.mocked(userStore.list);
const mockProjectList = vi.mocked(projectStore.list);
const mockListAttendees = vi.mocked(eventAttendanceStore.listAttendeesByEvent);

describe('team-selection-attendees httpTrigger GET', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkAuthAndConnect).mockResolvedValue({ uid: 'firebase-uid' });
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
    const both = { _id: 'a1', roles: ['developer', 'designer'] };
    const devOnly = { _id: 'a2', roles: ['developer'] };
    mockListAttendees.mockResolvedValue([both, devOnly] as never);
    const context = createMockContext({ bindingData: { projectId: 'p1' } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(mockListAttendees).toHaveBeenCalledWith('e1');
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toEqual({
      developer: [both, devOnly],
      designer: [both],
    });
  });
});
