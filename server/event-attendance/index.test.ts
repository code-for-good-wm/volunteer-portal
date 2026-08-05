import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createMockContext,
  createMockRequest,
} from '../lib/test-utils/mockContext';

vi.mock('../lib/helpers', () => ({
  checkAuthAndConnect: vi.fn(),
  checkBindingDataUserId: vi.fn(),
}));
vi.mock('../lib/models/store', () => ({
  eventAttendanceStore: {
    listByUser: vi.fn(),
    listByUserAndEvent: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { checkAuthAndConnect, checkBindingDataUserId } from '../lib/helpers';
import { eventAttendanceStore } from '../lib/models/store';
import httpTrigger from './index';

const mockCheckAuthAndConnect = vi.mocked(checkAuthAndConnect);
const mockCheckBindingDataUserId = vi.mocked(checkBindingDataUserId);
const mockListByUser = vi.mocked(eventAttendanceStore.listByUser);
const mockListByUserAndEvent = vi.mocked(
  eventAttendanceStore.listByUserAndEvent,
);
const mockCreate = vi.mocked(eventAttendanceStore.create);

describe('event-attendance/index httpTrigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCheckAuthAndConnect.mockResolvedValue({ uid: 'firebase-uid' });
  });

  it("forbids access to another user's attendance data", async () => {
    mockCheckBindingDataUserId.mockResolvedValue({
      status: 403,
      body: { error: { code: 403, message: 'Forbidden' } },
    } as never);
    const context = createMockContext({ bindingData: { userId: 'other' } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(context.res?.status).toBe(403);
    expect(mockListByUser).not.toHaveBeenCalled();
  });

  it('returns all attendance records for the caller when no eventId is given', async () => {
    mockCheckBindingDataUserId.mockResolvedValue({
      status: 200,
      body: { _id: 'user-1' },
    } as never);
    mockListByUser.mockResolvedValue([{ eventId: 'e1' }] as never);
    const context = createMockContext({ bindingData: { userId: 'user-1' } });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(mockListByUser).toHaveBeenCalledWith('user-1', []);
    expect(context.res?.status).toBe(200);
  });

  it('returns a single attendance record when eventId is given', async () => {
    mockCheckBindingDataUserId.mockResolvedValue({
      status: 200,
      body: { _id: 'user-1' },
    } as never);
    mockListByUserAndEvent.mockResolvedValue({ eventId: 'e1' } as never);
    const context = createMockContext({
      bindingData: { userId: 'user-1', eventId: 'e1' },
    });

    await httpTrigger(context, createMockRequest({ method: 'GET' }));

    expect(mockListByUserAndEvent).toHaveBeenCalledWith('user-1', 'e1');
    expect(context.res?.status).toBe(200);
  });

  it('creates a new attendance record on POST', async () => {
    mockCheckBindingDataUserId.mockResolvedValue({
      status: 200,
      body: { _id: 'user-1' },
    } as never);
    mockCreate.mockResolvedValue({ _id: 'attendance-1' } as never);
    const request = createMockRequest({
      method: 'POST',
      body: { attendance: 'yes' },
    });
    const context = createMockContext({
      bindingData: { userId: 'user-1', eventId: 'e1' },
      req: request,
    });

    await httpTrigger(context, request);

    expect(mockCreate).toHaveBeenCalledWith('user-1', 'e1', {
      attendance: 'yes',
    });
    expect(context.res?.status).toBe(201);
  });
});
