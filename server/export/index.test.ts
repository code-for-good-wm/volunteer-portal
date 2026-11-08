import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Types } from 'mongoose';
import {
  createMockContext,
  createMockRequest,
} from '../lib/test-utils/mockContext';

vi.mock('../lib/helpers', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../lib/helpers')>()),
  checkAuthAndConnect: vi.fn(),
}));
vi.mock('../lib/models/store', () => ({
  userStore: { list: vi.fn(), listAll: vi.fn() },
  profileStore: { listAll: vi.fn() },
  skillStore: { listAll: vi.fn() },
  eventStore: { listAll: vi.fn() },
  eventAttendanceStore: { list: vi.fn() },
}));

import { checkAuthAndConnect } from '../lib/helpers';
import {
  eventAttendanceStore,
  eventStore,
  profileStore,
  skillStore,
  userStore,
} from '../lib/models/store';
import { UserRole } from '../lib/models/enums/user-role.enum';
import httpTrigger from './index';

const volunteerId = new Types.ObjectId();
const volunteer = {
  _id: volunteerId,
  email: 'volunteer@example.com',
  firstName: 'Val',
  lastName: 'Unteer',
  userRole: UserRole.VOLUNTEER,
};

describe('export/index httpTrigger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkAuthAndConnect).mockResolvedValue({ uid: 'firebase-uid' });
    vi.mocked(userStore.list).mockResolvedValue({
      userRole: UserRole.ADMIN,
    } as never);
    vi.mocked(userStore.listAll).mockResolvedValue([volunteer] as never);
    vi.mocked(profileStore.listAll).mockResolvedValue([] as never);
    vi.mocked(skillStore.listAll).mockResolvedValue([] as never);
    vi.mocked(eventAttendanceStore.list).mockResolvedValue([] as never);
  });

  it('forbids volunteers from exporting', async () => {
    vi.mocked(userStore.list).mockResolvedValue({
      userRole: UserRole.VOLUNTEER,
    } as never);
    const context = createMockContext();

    await httpTrigger(context, createMockRequest({ method: 'POST' }));

    expect(context.res?.status).toBe(403);
  });

  it('still exports every user when the Weekend for Good event is missing', async () => {
    vi.mocked(eventStore.listAll).mockResolvedValue([] as never);
    const context = createMockContext();

    await httpTrigger(context, createMockRequest({ method: 'POST' }));

    expect(context.res?.status).toBe(200);
    expect(context.res?.headers['Content-Type']).toBe('text/csv');
    expect(context.res?.body).toContain('volunteer@example.com');
    expect(eventAttendanceStore.list).not.toHaveBeenCalled();
  });

  it("includes each user's attendance for the Weekend for Good event", async () => {
    const eventId = new Types.ObjectId();
    vi.mocked(eventStore.listAll).mockResolvedValue([
      { _id: eventId, description: 'Weekend for Good 2025' },
    ] as never);
    vi.mocked(eventAttendanceStore.list).mockResolvedValue([
      { user: volunteerId, attendance: 'attending' },
    ] as never);
    const context = createMockContext();

    await httpTrigger(context, createMockRequest({ method: 'POST' }));

    expect(eventAttendanceStore.list).toHaveBeenCalledWith(eventId);
    expect(context.res?.body).toMatch(/volunteer@example\.com.*attending/);
  });
});
