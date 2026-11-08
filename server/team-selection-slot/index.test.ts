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
  userStore: { list: vi.fn(), listById: vi.fn() },
  projectStore: { list: vi.fn() },
  positionStore: { list: vi.fn() },
  slotStore: {
    list: vi.fn(),
    assign: vi.fn(),
    unassign: vi.fn(),
    listWithDetails: vi.fn(),
    hasConfirmedSlotForEvent: vi.fn(),
  },
}));

import { checkAuthAndConnect } from '../lib/helpers';
import {
  userStore,
  projectStore,
  positionStore,
  slotStore,
} from '../lib/models/store';
import httpTrigger from './index';

const mockUserList = vi.mocked(userStore.list);
const mockProjectList = vi.mocked(projectStore.list);

const SLOT_ID = '64d926229cf67781f87e7230';
const USER_ID = '64d926229cf67781f87e7231';
const OTHER_ID = '64d926229cf67781f87e7232';

describe('team-selection-slot httpTrigger PUT', () => {
  const put = (body: unknown, bindingData: Record<string, string> = {}) => {
    const context = createMockContext({
      bindingData: { slotId: SLOT_ID, ...bindingData },
    });
    context.req = createMockRequest({ method: 'PUT', body });
    return { context, run: () => httpTrigger(context, context.req!) };
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(checkAuthAndConnect).mockResolvedValue({ uid: 'firebase-uid' });
    mockUserList.mockResolvedValue({ userRole: UserRole.ADMIN } as never);
    mockProjectList.mockResolvedValue({ _id: 'p1' } as never);
    vi.mocked(slotStore.list).mockResolvedValue({
      _id: SLOT_ID,
      position: 'pos1',
      status: 'open',
    } as never);
    vi.mocked(positionStore.list).mockResolvedValue({
      _id: 'pos1',
      project: 'p1',
    } as never);
    vi.mocked(userStore.listById).mockResolvedValue({ _id: USER_ID } as never);
    vi.mocked(slotStore.hasConfirmedSlotForEvent).mockResolvedValue(false);
    vi.mocked(slotStore.assign).mockResolvedValue({ _id: SLOT_ID } as never);
  });

  it('forbids callers without slot-edit permission', async () => {
    mockUserList.mockResolvedValue({ userRole: UserRole.VOLUNTEER } as never);
    const { context, run } = put({ userId: USER_ID });

    await run();

    expect(context.res?.status).toBe(403);
    expect(slotStore.assign).not.toHaveBeenCalled();
  });

  it("returns 404 when the slot's project no longer exists", async () => {
    mockProjectList.mockResolvedValue(null);
    const { context, run } = put({ userId: USER_ID });

    await run();

    expect(context.res?.status).toBe(404);
  });

  it('returns 404 when the slot id is missing, malformed or unknown', async () => {
    const missing = put({ userId: USER_ID }, { slotId: '' });
    await missing.run();
    const malformed = put({ userId: USER_ID }, { slotId: 'nope' });
    await malformed.run();
    vi.mocked(slotStore.list).mockResolvedValue(null);
    const unknown = put({ userId: USER_ID });
    await unknown.run();

    for (const { context } of [missing, malformed, unknown]) {
      expect(context.res?.status).toBe(404);
    }
    expect(slotStore.assign).not.toHaveBeenCalled();
  });

  it("derives the project from the slot's position", async () => {
    const { context, run } = put({ userId: USER_ID });

    await run();

    expect(positionStore.list).toHaveBeenCalledWith('pos1');
    expect(mockProjectList).toHaveBeenCalledWith('p1');
    expect(context.res?.status).toBe(200);
  });

  it('rejects a malformed userId', async () => {
    const { context, run } = put({ userId: 'nope' });

    await run();

    expect(context.res?.status).toBe(400);
    expect(slotStore.assign).not.toHaveBeenCalled();
    expect(slotStore.unassign).not.toHaveBeenCalled();
  });

  it('removes the volunteer when no userId is given and the slot has one', async () => {
    vi.mocked(slotStore.list).mockResolvedValue({
      _id: SLOT_ID,
      position: 'pos1',
      user: USER_ID,
      status: 'invited',
    } as never);
    const opened = { _id: SLOT_ID, status: 'open' };
    vi.mocked(slotStore.unassign).mockResolvedValue(opened as never);
    const { context, run } = put({ status: 'confirmed' });

    await run();

    expect(slotStore.unassign).toHaveBeenCalledWith(SLOT_ID);
    expect(slotStore.assign).not.toHaveBeenCalled();
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toBe(opened);
  });

  it('does nothing and returns the slot when no userId is given and the slot has no volunteer', async () => {
    const current = { _id: SLOT_ID, status: 'open' };
    vi.mocked(slotStore.listWithDetails).mockResolvedValue(current as never);
    const { context, run } = put({});

    await run();

    expect(slotStore.unassign).not.toHaveBeenCalled();
    expect(slotStore.assign).not.toHaveBeenCalled();
    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toBe(current);
  });

  it('rejects an unknown status and the open status', async () => {
    const unknown = put({ userId: USER_ID, status: 'wizard' });
    await unknown.run();
    const open = put({ userId: USER_ID, status: 'open' });
    await open.run();

    expect(unknown.context.res?.status).toBe(400);
    expect(open.context.res?.status).toBe(400);
    expect(slotStore.assign).not.toHaveBeenCalled();
  });

  it('returns 404 when the volunteer does not exist', async () => {
    vi.mocked(userStore.listById).mockResolvedValue(null);
    const { context, run } = put({ userId: USER_ID });

    await run();

    expect(context.res?.status).toBe(404);
    expect(slotStore.assign).not.toHaveBeenCalled();
  });

  it('defaults the status to invited, stamps invitedAt and returns the slot', async () => {
    const updated = { _id: SLOT_ID, status: 'invited', user: { _id: USER_ID } };
    vi.mocked(slotStore.assign).mockResolvedValue(updated as never);
    const { context, run } = put({ userId: USER_ID });

    await run();

    expect(context.res?.status).toBe(200);
    expect(context.res?.body).toBe(updated);
    expect(slotStore.assign).toHaveBeenCalledWith(
      SLOT_ID,
      expect.objectContaining({
        user: USER_ID,
        status: 'invited',
        invitedAt: expect.any(Date),
        respondedAt: undefined,
      }),
      true,
    );
  });

  it('uses the status from the body', async () => {
    const { context, run } = put({ userId: USER_ID, status: 'confirmed' });

    await run();

    expect(context.res?.status).toBe(200);
    expect(slotStore.assign).toHaveBeenCalledWith(
      SLOT_ID,
      expect.objectContaining({
        status: 'confirmed',
        respondedAt: expect.any(Date),
      }),
      true,
    );
  });

  it('returns 409 when confirming a volunteer who already has a confirmed slot for the event', async () => {
    vi.mocked(slotStore.hasConfirmedSlotForEvent).mockResolvedValue(true);
    const { context, run } = put({ userId: USER_ID, status: 'confirmed' });

    await run();

    expect(context.res?.status).toBe(409);
    expect(slotStore.assign).not.toHaveBeenCalled();
  });

  it('keeps response details when the same volunteer is re-saved', async () => {
    const invitedAt = new Date('2026-01-01');
    vi.mocked(slotStore.list).mockResolvedValue({
      _id: SLOT_ID,
      position: 'pos1',
      user: USER_ID,
      status: 'declined',
      invitedAt,
    } as never);
    const { run } = put({ userId: USER_ID, status: 'confirmed' });

    await run();

    expect(slotStore.assign).toHaveBeenCalledWith(
      SLOT_ID,
      expect.objectContaining({ invitedAt }),
      false,
    );
  });

  it('clears response details when the slot moves to a different volunteer', async () => {
    vi.mocked(slotStore.list).mockResolvedValue({
      _id: SLOT_ID,
      position: 'pos1',
      user: OTHER_ID,
      status: 'declined',
    } as never);
    const { run } = put({ userId: USER_ID });

    await run();

    expect(slotStore.assign).toHaveBeenCalledWith(
      SLOT_ID,
      expect.anything(),
      true,
    );
  });
});
