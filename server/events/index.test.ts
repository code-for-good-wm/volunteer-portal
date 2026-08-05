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
  eventStore: { listAll: vi.fn(), upcoming: vi.fn() },
}));

import { checkAuthAndConnect } from '../lib/helpers';
import { userStore, eventStore } from '../lib/models/store';
import httpTrigger from './index';

const mockCheckAuthAndConnect = vi.mocked(checkAuthAndConnect);
const mockUserList = vi.mocked(userStore.list);
const mockEventListAll = vi.mocked(eventStore.listAll);
const mockEventUpcoming = vi.mocked(eventStore.upcoming);

describe('events/index httpTrigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAuthAndConnect.mockResolvedValue({ uid: 'firebase-uid' });
  });

  it('returns the auth error result unchanged when auth/connect fails', async () => {
    mockCheckAuthAndConnect.mockResolvedValue({
      uid: '',
      result: { status: 401, body: {} },
    });
    const context = createMockContext();

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res).toEqual({ status: 401, body: {} });
    expect(mockUserList).not.toHaveBeenCalled();
  });

  it('returns 404 when the caller is not a known user', async () => {
    mockUserList.mockResolvedValue(null);
    const context = createMockContext();

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res?.status).toBe(404);
  });

  it('returns upcoming events for a normal volunteer', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.VOLUNTEER } as never);
    mockEventUpcoming.mockResolvedValue([{ name: 'Upcoming Event' }] as never);
    const context = createMockContext({ bindingData: { all: false } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(mockEventUpcoming).toHaveBeenCalled();
    expect(mockEventListAll).not.toHaveBeenCalled();
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toEqual([{ name: 'Upcoming Event' }]);
  });

  it('forbids a volunteer from requesting all events', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.VOLUNTEER } as never);
    const context = createMockContext({ bindingData: { all: true } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res?.status).toBe(403);
    expect(mockEventListAll).not.toHaveBeenCalled();
  });

  it('allows a boardmember to request all events', async () => {
    mockUserList.mockResolvedValue({
      userRole: UserRole.BOARDMEMBER,
    } as never);
    mockEventListAll.mockResolvedValue([{ name: 'Past Event' }] as never);
    const context = createMockContext({ bindingData: { all: true } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(mockEventListAll).toHaveBeenCalled();
    expect(context.res?.status).toBe(200);
  });
});
